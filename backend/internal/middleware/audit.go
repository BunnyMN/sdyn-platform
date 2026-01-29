package middleware

import (
	"encoding/json"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/sdyn/backend/internal/models"
	"github.com/sdyn/backend/internal/services"
)

// AuditConfig holds configuration for audit logging
type AuditConfig struct {
	// SkipPaths are paths that should not be audited
	SkipPaths []string
	// LogRequestBody enables logging of request bodies
	LogRequestBody bool
	// SensitiveFields are fields that should be redacted
	SensitiveFields []string
}

// DefaultAuditConfig returns default audit configuration
func DefaultAuditConfig() AuditConfig {
	return AuditConfig{
		SkipPaths: []string{
			"/health",
			"/ready",
			"/metrics",
			"/api/v1/auth/refresh",
		},
		LogRequestBody: true,
		SensitiveFields: []string{
			"password",
			"current_password",
			"new_password",
			"token",
			"refresh_token",
			"access_token",
			"secret",
			"api_key",
		},
	}
}

// AuditLogger creates an audit logging middleware
func AuditLogger(authzService *services.AuthorizationService, config ...AuditConfig) fiber.Handler {
	cfg := DefaultAuditConfig()
	if len(config) > 0 {
		cfg = config[0]
	}

	return func(c *fiber.Ctx) error {
		// Skip certain paths
		path := c.Path()
		for _, skipPath := range cfg.SkipPaths {
			if strings.HasPrefix(path, skipPath) {
				return c.Next()
			}
		}

		// Skip GET requests for list/read operations (optional, to reduce log volume)
		// Uncomment if you want to skip GET requests:
		// if c.Method() == "GET" && !strings.Contains(path, "/reports") {
		// 	return c.Next()
		// }

		start := time.Now()

		// Process request
		err := c.Next()

		// Build audit log
		auditLog := buildAuditLog(c, cfg, start)

		// Determine status
		statusCode := c.Response().StatusCode()
		auditLog.StatusCode = statusCode

		if statusCode >= 200 && statusCode < 300 {
			auditLog.Status = "success"
		} else if statusCode == 401 || statusCode == 403 {
			auditLog.Status = "denied"
		} else if statusCode >= 400 {
			auditLog.Status = "error"
		} else {
			auditLog.Status = "success"
		}

		// Log if it's a write operation or access denied
		shouldLog := c.Method() != "GET" ||
			auditLog.Status == "denied" ||
			strings.Contains(path, "/reports") ||
			strings.Contains(path, "/export")

		if shouldLog {
			// Save async to not block response
			go func() {
				ctx := c.Context()
				if saveErr := authzService.SaveAuditLog(ctx, auditLog); saveErr != nil {
					log.Error().Err(saveErr).Msg("Failed to save audit log")
				}
			}()

			// Also log to console for immediate visibility
			logEvent := log.Info()
			if auditLog.Status == "denied" {
				logEvent = log.Warn()
			} else if auditLog.Status == "error" {
				logEvent = log.Error()
			}

			logEvent.
				Str("audit_id", auditLog.ID).
				Str("user_id", auditLog.UserID).
				Str("action", auditLog.Action).
				Str("resource", auditLog.Resource).
				Str("status", auditLog.Status).
				Int("status_code", auditLog.StatusCode).
				Int64("response_time_ms", auditLog.ResponseTime).
				Str("ip", auditLog.IPAddress).
				Msg("Audit log")
		}

		return err
	}
}

func buildAuditLog(c *fiber.Ctx, cfg AuditConfig, start time.Time) *models.AuditLog {
	auditLog := &models.AuditLog{
		ID:            uuid.New().String(),
		Timestamp:     time.Now().UTC().Format(time.RFC3339),
		IPAddress:     c.IP(),
		UserAgent:     c.Get("User-Agent"),
		RequestMethod: c.Method(),
		RequestPath:   c.Path(),
		ResponseTime:  time.Since(start).Milliseconds(),
	}

	// Extract user info from context
	if userID, ok := c.Locals("user_id").(string); ok {
		auditLog.UserID = userID
	}
	if memberID, ok := c.Locals("member_id").(string); ok {
		auditLog.MemberID = memberID
	}
	if email, ok := c.Locals("email").(string); ok {
		auditLog.Email = email
	}
	if orgID, ok := c.Locals("organization_id").(*string); ok && orgID != nil {
		auditLog.OrganizationID = *orgID
	}

	// Determine action and resource from path and method
	auditLog.Action, auditLog.Resource, auditLog.ResourceID = parseActionFromRequest(c)

	// Log request body for non-GET requests (with sensitive data redacted)
	if cfg.LogRequestBody && c.Method() != "GET" {
		body := c.Body()
		if len(body) > 0 {
			var bodyMap map[string]interface{}
			if err := json.Unmarshal(body, &bodyMap); err == nil {
				// Redact sensitive fields
				for _, field := range cfg.SensitiveFields {
					if _, exists := bodyMap[field]; exists {
						bodyMap[field] = "[REDACTED]"
					}
				}
				auditLog.RequestBody = bodyMap
			}
		}
	}

	return auditLog
}

func parseActionFromRequest(c *fiber.Ctx) (action, resource, resourceID string) {
	path := c.Path()
	method := c.Method()

	// Remove /api/v1/ prefix
	path = strings.TrimPrefix(path, "/api/v1/")
	parts := strings.Split(path, "/")

	if len(parts) == 0 {
		return method, "unknown", ""
	}

	// First part is usually the resource
	resource = parts[0]

	// Check for resource ID
	if len(parts) > 1 {
		// Check if second part looks like a UUID or ID
		if isResourceID(parts[1]) {
			resourceID = parts[1]
		}
	}

	// Determine action based on method and path
	switch method {
	case "GET":
		if resourceID != "" {
			action = "read"
		} else {
			action = "list"
		}
		// Check for special actions
		if strings.Contains(path, "/export") {
			action = "export"
		} else if strings.Contains(path, "/report") {
			action = "report"
		}
	case "POST":
		action = "create"
		// Check for special actions
		if strings.Contains(path, "/login") {
			action = "login"
			resource = "auth"
		} else if strings.Contains(path, "/logout") {
			action = "logout"
			resource = "auth"
		} else if strings.Contains(path, "/register") {
			action = "register"
			resource = "auth"
		} else if strings.Contains(path, "/refresh") {
			action = "refresh"
			resource = "auth"
		} else if strings.Contains(path, "/approve") {
			action = "approve"
		} else if strings.Contains(path, "/reject") {
			action = "reject"
		} else if strings.Contains(path, "/import") {
			action = "import"
		}
	case "PUT":
		action = "update"
	case "PATCH":
		action = "update"
		if strings.Contains(path, "/status") {
			action = "status_change"
		}
	case "DELETE":
		action = "delete"
	default:
		action = strings.ToLower(method)
	}

	return action, resource, resourceID
}

func isResourceID(s string) bool {
	// Check if it's a UUID
	if _, err := uuid.Parse(s); err == nil {
		return true
	}
	// Check if it looks like an ID (alphanumeric, potentially with hyphens)
	if len(s) > 0 && !strings.Contains(s, "/") {
		// Not a sub-resource path
		for _, r := range s {
			if r != '-' && r != '_' && (r < '0' || r > '9') && (r < 'a' || r > 'z') && (r < 'A' || r > 'Z') {
				return false
			}
		}
		return true
	}
	return false
}

// AuditAction is a helper to manually create audit log entries for specific actions
func AuditAction(c *fiber.Ctx, authzService *services.AuthorizationService, action, resource, resourceID string, changes map[string]interface{}) {
	auditLog := &models.AuditLog{
		ID:            uuid.New().String(),
		Timestamp:     time.Now().UTC().Format(time.RFC3339),
		IPAddress:     c.IP(),
		UserAgent:     c.Get("User-Agent"),
		RequestMethod: c.Method(),
		RequestPath:   c.Path(),
		Action:        action,
		Resource:      resource,
		ResourceID:    resourceID,
		Status:        "success",
		StatusCode:    200,
		Changes:       changes,
	}

	// Extract user info
	if userID, ok := c.Locals("user_id").(string); ok {
		auditLog.UserID = userID
	}
	if memberID, ok := c.Locals("member_id").(string); ok {
		auditLog.MemberID = memberID
	}
	if email, ok := c.Locals("email").(string); ok {
		auditLog.Email = email
	}
	if orgID, ok := c.Locals("organization_id").(*string); ok && orgID != nil {
		auditLog.OrganizationID = *orgID
	}

	// Save async
	go func() {
		ctx := c.Context()
		if err := authzService.SaveAuditLog(ctx, auditLog); err != nil {
			log.Error().Err(err).Msg("Failed to save manual audit log")
		}
	}()
}
