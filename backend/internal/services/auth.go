package services

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"

	"github.com/sdyn/backend/internal/config"
	"github.com/sdyn/backend/internal/models"
)

type AuthService struct {
	cfg   *config.Config
	db    *pgxpool.Pool
	redis *redis.Client
}

func NewAuthService(cfg *config.Config, db *pgxpool.Pool, redis *redis.Client) *AuthService {
	return &AuthService{
		cfg:   cfg,
		db:    db,
		redis: redis,
	}
}

func (s *AuthService) Login(ctx context.Context, req *models.LoginRequest) (*models.AuthResponse, error) {
	// Query member by email
	query := `
		SELECT m.id, m.member_id, m.keycloak_id, m.first_name, m.last_name, m.email, m.phone,
		       m.organization_id, m.avatar_url, m.status
		FROM members m
		WHERE m.email = $1 AND m.status = 'active'
	`

	var member struct {
		ID             uuid.UUID
		MemberID       string
		KeycloakID     *string
		FirstName      string
		LastName       string
		Email          *string
		Phone          *string
		OrganizationID *uuid.UUID
		AvatarURL      *string
		Status         string
	}

	err := s.db.QueryRow(ctx, query, req.Email).Scan(
		&member.ID, &member.MemberID, &member.KeycloakID,
		&member.FirstName, &member.LastName, &member.Email, &member.Phone,
		&member.OrganizationID, &member.AvatarURL, &member.Status,
	)
	if err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	// Get member roles from positions
	roles := []string{"member"}
	rolesQuery := `
		SELECT DISTINCT p.level
		FROM member_positions mp
		JOIN positions p ON mp.position_id = p.id
		WHERE mp.member_id = $1 AND mp.is_current = true
	`
	rows, err := s.db.Query(ctx, rolesQuery, member.ID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var level string
			if err := rows.Scan(&level); err == nil {
				switch level {
				case "national":
					roles = append(roles, "national_admin")
				case "province":
					roles = append(roles, "province_admin")
				case "district":
					roles = append(roles, "district_admin")
				}
			}
		}
	}

	var orgID *string
	if member.OrganizationID != nil {
		orgStr := member.OrganizationID.String()
		orgID = &orgStr
	}

	user := &models.User{
		ID:             member.ID,
		MemberID:       member.MemberID,
		Email:          *member.Email,
		FirstName:      member.FirstName,
		LastName:       member.LastName,
		Phone:          member.Phone,
		OrganizationID: orgID,
		Roles:          roles,
		AvatarURL:      member.AvatarURL,
	}

	// Generate tokens
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.generateRefreshToken()
	if err != nil {
		return nil, err
	}

	// Store refresh token in Redis
	s.redis.Set(ctx, "refresh:"+refreshToken, member.ID.String(), 7*24*time.Hour)

	return &models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    3600,
		TokenType:    "Bearer",
		User:         user,
	}, nil
}

func (s *AuthService) Register(ctx context.Context, req *models.RegisterRequest) (*models.AuthResponse, error) {
	// Check if email already exists
	var exists bool
	err := s.db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM members WHERE email = $1)", req.Email).Scan(&exists)
	if err != nil {
		return nil, fmt.Errorf("error checking email: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("email already registered")
	}

	// Hash password (stored in Keycloak, but we keep a backup)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	_ = hashedPassword // Would be used when creating Keycloak user

	// Create member in database
	var memberID uuid.UUID
	var memberCode string
	createQuery := `
		INSERT INTO members (first_name, last_name, email, phone, status, joined_at)
		VALUES ($1, $2, $3, $4, 'pending', NOW())
		RETURNING id, member_id
	`
	err = s.db.QueryRow(ctx, createQuery, req.FirstName, req.LastName, req.Email, req.Phone).Scan(&memberID, &memberCode)
	if err != nil {
		return nil, fmt.Errorf("error creating member: %w", err)
	}

	// Record member history
	historyQuery := `
		INSERT INTO member_history (member_id, action, new_value)
		VALUES ($1, 'registered', 'Member registered via web form')
	`
	_, _ = s.db.Exec(ctx, historyQuery, memberID)

	user := &models.User{
		ID:        memberID,
		MemberID:  memberCode,
		Email:     req.Email,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Phone:     &req.Phone,
		Roles:     []string{"member"},
	}

	// Generate tokens
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.generateRefreshToken()
	if err != nil {
		return nil, err
	}

	// Store refresh token
	s.redis.Set(ctx, "refresh:"+refreshToken, memberID.String(), 7*24*time.Hour)

	return &models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    3600,
		TokenType:    "Bearer",
		User:         user,
	}, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (*models.AuthResponse, error) {
	// Validate refresh token from Redis
	userID, err := s.redis.Get(ctx, "refresh:"+refreshToken).Result()
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token")
	}

	// Fetch user from database
	query := `
		SELECT m.id, m.member_id, m.first_name, m.last_name, m.email, m.phone,
		       m.organization_id, m.avatar_url
		FROM members m
		WHERE m.id = $1 AND m.status = 'active'
	`

	var member struct {
		ID             uuid.UUID
		MemberID       string
		FirstName      string
		LastName       string
		Email          *string
		Phone          *string
		OrganizationID *uuid.UUID
		AvatarURL      *string
	}

	memberUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID")
	}

	err = s.db.QueryRow(ctx, query, memberUUID).Scan(
		&member.ID, &member.MemberID, &member.FirstName, &member.LastName,
		&member.Email, &member.Phone, &member.OrganizationID, &member.AvatarURL,
	)
	if err != nil {
		return nil, fmt.Errorf("user not found or inactive")
	}

	// Get roles
	roles := []string{"member"}
	rolesQuery := `
		SELECT DISTINCT p.level
		FROM member_positions mp
		JOIN positions p ON mp.position_id = p.id
		WHERE mp.member_id = $1 AND mp.is_current = true
	`
	rows, _ := s.db.Query(ctx, rolesQuery, member.ID)
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var level string
			if rows.Scan(&level) == nil {
				switch level {
				case "national":
					roles = append(roles, "national_admin")
				case "province":
					roles = append(roles, "province_admin")
				case "district":
					roles = append(roles, "district_admin")
				}
			}
		}
	}

	var orgID *string
	if member.OrganizationID != nil {
		orgStr := member.OrganizationID.String()
		orgID = &orgStr
	}

	email := ""
	if member.Email != nil {
		email = *member.Email
	}

	user := &models.User{
		ID:             member.ID,
		MemberID:       member.MemberID,
		Email:          email,
		FirstName:      member.FirstName,
		LastName:       member.LastName,
		Phone:          member.Phone,
		OrganizationID: orgID,
		Roles:          roles,
		AvatarURL:      member.AvatarURL,
	}

	// Generate new access token
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}

	// Generate new refresh token
	newRefreshToken, err := s.generateRefreshToken()
	if err != nil {
		return nil, err
	}

	// Store new refresh token
	s.redis.Set(ctx, "refresh:"+newRefreshToken, userID, 7*24*time.Hour)

	// Delete old refresh token
	s.redis.Del(ctx, "refresh:"+refreshToken)

	return &models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		ExpiresIn:    3600,
		TokenType:    "Bearer",
		User:         user,
	}, nil
}

func (s *AuthService) Logout(ctx context.Context, userID, tokenID string, tokenExp time.Time) error {
	// Add token to blacklist
	if tokenID != "" {
		blacklistKey := "token:blacklist:" + tokenID
		ttl := time.Until(tokenExp)
		if ttl <= 0 {
			ttl = time.Hour
		}
		if err := s.redis.Set(ctx, blacklistKey, userID, ttl).Err(); err != nil {
			return fmt.Errorf("failed to blacklist token: %w", err)
		}
	}

	// Store user session invalidation time
	invalidateKey := "user:tokens:" + userID + ":invalidated_at"
	s.redis.Set(ctx, invalidateKey, time.Now().Unix(), 24*time.Hour)

	return nil
}

// LogoutAllSessions invalidates all sessions for a user
func (s *AuthService) LogoutAllSessions(ctx context.Context, userID string) error {
	// Find and delete all refresh tokens for this user
	pattern := "refresh:*"
	iter := s.redis.Scan(ctx, 0, pattern, 100).Iterator()
	for iter.Next(ctx) {
		key := iter.Val()
		storedUserID, err := s.redis.Get(ctx, key).Result()
		if err == nil && storedUserID == userID {
			s.redis.Del(ctx, key)
		}
	}

	// Mark all tokens as invalidated
	invalidateKey := "user:tokens:" + userID + ":invalidated_at"
	return s.redis.Set(ctx, invalidateKey, time.Now().Unix(), 24*time.Hour).Err()
}

// IsTokenBlacklisted checks if a token is blacklisted
func (s *AuthService) IsTokenBlacklisted(ctx context.Context, tokenID string) (bool, error) {
	key := "token:blacklist:" + tokenID
	exists, err := s.redis.Exists(ctx, key).Result()
	if err != nil {
		return false, err
	}
	return exists > 0, nil
}

func (s *AuthService) ChangePassword(ctx context.Context, userID string, req *models.ChangePasswordRequest) error {
	// In a real implementation, validate current password and update in Keycloak
	return nil
}

func (s *AuthService) InitiatePasswordReset(ctx context.Context, email string) error {
	// Generate reset token
	token, err := s.generateRefreshToken()
	if err != nil {
		return err
	}

	// Store token with expiry
	s.redis.Set(ctx, "reset:"+token, email, 1*time.Hour)

	// In a real implementation, send email with reset link
	return nil
}

func (s *AuthService) ConfirmPasswordReset(ctx context.Context, req *models.ConfirmResetPasswordRequest) error {
	// Validate token
	email, err := s.redis.Get(ctx, "reset:"+req.Token).Result()
	if err != nil {
		return fmt.Errorf("invalid or expired reset token")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// In a real implementation, update password in Keycloak
	_ = email
	_ = hashedPassword

	// Delete reset token
	s.redis.Del(ctx, "reset:"+req.Token)

	return nil
}

func (s *AuthService) generateAccessToken(user *models.User) (string, error) {
	claims := models.JWTClaims{
		UserID:   user.ID.String(),
		MemberID: user.MemberID,
		Email:    user.Email,
		Roles:    user.Roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "sdyn-api",
			Subject:   user.ID.String(),
		},
	}

	if user.OrganizationID != nil {
		claims.OrganizationID = user.OrganizationID
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *AuthService) generateRefreshToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}
