package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"

	"github.com/sdyn/backend/internal/models"
)

// AuthorizationService handles permission checking and data scoping
type AuthorizationService struct {
	db    *pgxpool.Pool
	redis *redis.Client
}

// NewAuthorizationService creates a new authorization service
func NewAuthorizationService(db *pgxpool.Pool, redis *redis.Client) *AuthorizationService {
	return &AuthorizationService{
		db:    db,
		redis: redis,
	}
}

// CanAccess checks if a user has permission to perform an action on a resource
func (s *AuthorizationService) CanAccess(roles []string, resource models.Resource, action models.Action) bool {
	for _, role := range roles {
		if rolePerms, ok := models.PermissionMatrix[role]; ok {
			for _, perm := range rolePerms.Permissions {
				if perm.Resource == resource && perm.Action == action {
					return true
				}
			}
		}
	}
	return false
}

// GetScope returns the data scope for a user based on their highest role
func (s *AuthorizationService) GetScope(roles []string) models.Scope {
	// Priority: national > province > district > own
	for _, role := range roles {
		if role == "national_admin" {
			return models.ScopeAll
		}
	}
	for _, role := range roles {
		if role == "province_admin" {
			return models.ScopeProvince
		}
	}
	for _, role := range roles {
		if role == "district_admin" {
			return models.ScopeDistrict
		}
	}
	return models.ScopeOwn
}

// DataScopeFilter represents filter conditions for data scoping
type DataScopeFilter struct {
	Scope          models.Scope
	OrganizationID *uuid.UUID
	ProvinceID     *uuid.UUID
	DistrictID     *uuid.UUID
	UserID         *uuid.UUID
}

// GetDataScopeFilter returns the data scope filter based on user context
func (s *AuthorizationService) GetDataScopeFilter(ctx context.Context, c *fiber.Ctx) (*DataScopeFilter, error) {
	roles, _ := c.Locals("roles").([]string)
	userID, _ := c.Locals("user_id").(string)
	orgIDStr, _ := c.Locals("organization_id").(*string)

	scope := s.GetScope(roles)
	filter := &DataScopeFilter{Scope: scope}

	if userID != "" {
		uid, err := uuid.Parse(userID)
		if err == nil {
			filter.UserID = &uid
		}
	}

	// If national admin, no additional filters needed
	if scope == models.ScopeAll {
		return filter, nil
	}

	// Get user's organization details for scoping
	if orgIDStr != nil && *orgIDStr != "" {
		orgID, err := uuid.Parse(*orgIDStr)
		if err != nil {
			return filter, nil
		}
		filter.OrganizationID = &orgID

		// Get organization's province and district
		var provinceID, districtID *uuid.UUID
		err = s.db.QueryRow(ctx, `
			SELECT province_id, district_id FROM organizations WHERE id = $1
		`, orgID).Scan(&provinceID, &districtID)
		if err == nil {
			filter.ProvinceID = provinceID
			filter.DistrictID = districtID
		}
	}

	return filter, nil
}

// BuildScopeCondition builds SQL WHERE conditions based on scope
func (s *AuthorizationService) BuildScopeCondition(filter *DataScopeFilter, tableAlias string) (string, []interface{}) {
	if filter.Scope == models.ScopeAll {
		return "", nil
	}

	var condition string
	var args []interface{}

	switch filter.Scope {
	case models.ScopeProvince:
		if filter.ProvinceID != nil {
			if tableAlias != "" {
				condition = fmt.Sprintf("%s.province_id = $1", tableAlias)
			} else {
				condition = "province_id = $1"
			}
			args = append(args, *filter.ProvinceID)
		}
	case models.ScopeDistrict:
		if filter.DistrictID != nil {
			if tableAlias != "" {
				condition = fmt.Sprintf("%s.district_id = $1", tableAlias)
			} else {
				condition = "district_id = $1"
			}
			args = append(args, *filter.DistrictID)
		} else if filter.OrganizationID != nil {
			if tableAlias != "" {
				condition = fmt.Sprintf("%s.organization_id = $1", tableAlias)
			} else {
				condition = "organization_id = $1"
			}
			args = append(args, *filter.OrganizationID)
		}
	case models.ScopeOwn:
		if filter.UserID != nil {
			if tableAlias != "" {
				condition = fmt.Sprintf("%s.id = $1", tableAlias)
			} else {
				condition = "id = $1"
			}
			args = append(args, *filter.UserID)
		}
	}

	return condition, args
}

// CanAccessResource checks if user can access a specific resource instance
func (s *AuthorizationService) CanAccessResource(ctx context.Context, c *fiber.Ctx, resource models.Resource, resourceID uuid.UUID) (bool, error) {
	filter, err := s.GetDataScopeFilter(ctx, c)
	if err != nil {
		return false, err
	}

	// National admin can access everything
	if filter.Scope == models.ScopeAll {
		return true, nil
	}

	// Check based on resource type
	var query string
	var args []interface{}

	switch resource {
	case models.ResourceMember:
		switch filter.Scope {
		case models.ScopeProvince:
			query = "SELECT EXISTS(SELECT 1 FROM members WHERE id = $1 AND province_id = $2)"
			args = []interface{}{resourceID, filter.ProvinceID}
		case models.ScopeDistrict:
			query = "SELECT EXISTS(SELECT 1 FROM members WHERE id = $1 AND district_id = $2)"
			args = []interface{}{resourceID, filter.DistrictID}
		case models.ScopeOwn:
			query = "SELECT EXISTS(SELECT 1 FROM members WHERE id = $1 AND id = $2)"
			args = []interface{}{resourceID, filter.UserID}
		}

	case models.ResourceOrganization:
		switch filter.Scope {
		case models.ScopeProvince:
			query = "SELECT EXISTS(SELECT 1 FROM organizations WHERE id = $1 AND province_id = $2)"
			args = []interface{}{resourceID, filter.ProvinceID}
		case models.ScopeDistrict:
			query = "SELECT EXISTS(SELECT 1 FROM organizations WHERE id = $1 AND (id = $2 OR parent_id = $2))"
			args = []interface{}{resourceID, filter.OrganizationID}
		default:
			return false, nil
		}

	case models.ResourceEvent:
		switch filter.Scope {
		case models.ScopeProvince:
			query = `SELECT EXISTS(
				SELECT 1 FROM events e
				JOIN organizations o ON e.organization_id = o.id
				WHERE e.id = $1 AND o.province_id = $2
			)`
			args = []interface{}{resourceID, filter.ProvinceID}
		case models.ScopeDistrict:
			query = `SELECT EXISTS(
				SELECT 1 FROM events e
				WHERE e.id = $1 AND e.organization_id = $2
			)`
			args = []interface{}{resourceID, filter.OrganizationID}
		default:
			return true, nil // Events are generally readable
		}

	case models.ResourceFee:
		switch filter.Scope {
		case models.ScopeProvince:
			query = `SELECT EXISTS(
				SELECT 1 FROM membership_fees f
				JOIN members m ON f.member_id = m.id
				WHERE f.id = $1 AND m.province_id = $2
			)`
			args = []interface{}{resourceID, filter.ProvinceID}
		case models.ScopeDistrict:
			query = `SELECT EXISTS(
				SELECT 1 FROM membership_fees f
				JOIN members m ON f.member_id = m.id
				WHERE f.id = $1 AND m.district_id = $2
			)`
			args = []interface{}{resourceID, filter.DistrictID}
		case models.ScopeOwn:
			query = `SELECT EXISTS(
				SELECT 1 FROM membership_fees f
				WHERE f.id = $1 AND f.member_id = $2
			)`
			args = []interface{}{resourceID, filter.UserID}
		}

	default:
		return true, nil
	}

	if query == "" {
		return false, nil
	}

	var exists bool
	err = s.db.QueryRow(ctx, query, args...).Scan(&exists)
	if err != nil {
		log.Error().Err(err).Msg("Failed to check resource access")
		return false, err
	}

	return exists, nil
}

// Token Blacklist Management

const tokenBlacklistPrefix = "token:blacklist:"
const userTokensPrefix = "user:tokens:"

// BlacklistToken adds a token to the blacklist
func (s *AuthorizationService) BlacklistToken(ctx context.Context, tokenID, userID, reason string, expiresAt time.Time) error {
	blacklist := models.TokenBlacklist{
		TokenID:   tokenID,
		UserID:    userID,
		ExpiresAt: expiresAt.Unix(),
		RevokedAt: time.Now().Unix(),
		Reason:    reason,
	}

	data, err := json.Marshal(blacklist)
	if err != nil {
		return err
	}

	// Store in Redis with expiration matching token expiry
	ttl := time.Until(expiresAt)
	if ttl <= 0 {
		ttl = time.Hour // Minimum 1 hour for already expired tokens
	}

	key := tokenBlacklistPrefix + tokenID
	if err := s.redis.Set(ctx, key, data, ttl).Err(); err != nil {
		return err
	}

	log.Info().
		Str("token_id", tokenID).
		Str("user_id", userID).
		Str("reason", reason).
		Msg("Token blacklisted")

	return nil
}

// IsTokenBlacklisted checks if a token is blacklisted
func (s *AuthorizationService) IsTokenBlacklisted(ctx context.Context, tokenID string) (bool, error) {
	key := tokenBlacklistPrefix + tokenID
	exists, err := s.redis.Exists(ctx, key).Result()
	if err != nil {
		return false, err
	}
	return exists > 0, nil
}

// BlacklistAllUserTokens blacklists all tokens for a user (for logout all sessions)
func (s *AuthorizationService) BlacklistAllUserTokens(ctx context.Context, userID string) error {
	// Store a marker that all tokens before this time are invalid
	key := userTokensPrefix + userID + ":invalidated_at"
	return s.redis.Set(ctx, key, time.Now().Unix(), 24*time.Hour).Err()
}

// IsUserTokenInvalidated checks if user's tokens were mass-invalidated after a certain time
func (s *AuthorizationService) IsUserTokenInvalidated(ctx context.Context, userID string, tokenIssuedAt time.Time) (bool, error) {
	key := userTokensPrefix + userID + ":invalidated_at"
	val, err := s.redis.Get(ctx, key).Int64()
	if err == redis.Nil {
		return false, nil
	}
	if err != nil {
		return false, err
	}

	return tokenIssuedAt.Unix() < val, nil
}

// Audit Log Storage

const auditLogPrefix = "audit:log:"

// SaveAuditLog saves an audit log entry
func (s *AuthorizationService) SaveAuditLog(ctx context.Context, auditLog *models.AuditLog) error {
	// Store in Redis for recent logs (24 hours)
	data, err := json.Marshal(auditLog)
	if err != nil {
		return err
	}

	// Add to sorted set for time-based queries
	key := auditLogPrefix + time.Now().Format("2006-01-02")
	score := float64(time.Now().UnixNano())

	if err := s.redis.ZAdd(ctx, key, redis.Z{
		Score:  score,
		Member: data,
	}).Err(); err != nil {
		log.Error().Err(err).Msg("Failed to save audit log to Redis")
	}

	// Set expiration on the daily key
	s.redis.Expire(ctx, key, 7*24*time.Hour)

	// Also store in PostgreSQL for long-term storage
	_, err = s.db.Exec(ctx, `
		INSERT INTO audit_logs (
			id, timestamp, user_id, member_id, email, action, resource,
			resource_id, organization_id, ip_address, user_agent, status,
			status_code, error_message, request_method, request_path,
			request_body, response_time_ms, changes
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
		)
	`,
		auditLog.ID,
		auditLog.Timestamp,
		auditLog.UserID,
		auditLog.MemberID,
		auditLog.Email,
		auditLog.Action,
		auditLog.Resource,
		auditLog.ResourceID,
		auditLog.OrganizationID,
		auditLog.IPAddress,
		auditLog.UserAgent,
		auditLog.Status,
		auditLog.StatusCode,
		auditLog.ErrorMessage,
		auditLog.RequestMethod,
		auditLog.RequestPath,
		auditLog.RequestBody,
		auditLog.ResponseTime,
		auditLog.Changes,
	)

	if err != nil {
		// Log error but don't fail the request
		log.Error().Err(err).Msg("Failed to save audit log to PostgreSQL")
	}

	return nil
}

// GetRecentAuditLogs retrieves recent audit logs
func (s *AuthorizationService) GetRecentAuditLogs(ctx context.Context, limit int64) ([]models.AuditLog, error) {
	key := auditLogPrefix + time.Now().Format("2006-01-02")

	results, err := s.redis.ZRevRange(ctx, key, 0, limit-1).Result()
	if err != nil {
		return nil, err
	}

	logs := make([]models.AuditLog, 0, len(results))
	for _, data := range results {
		var log models.AuditLog
		if err := json.Unmarshal([]byte(data), &log); err != nil {
			continue
		}
		logs = append(logs, log)
	}

	return logs, nil
}
