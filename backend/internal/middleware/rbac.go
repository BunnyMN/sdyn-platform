package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/sdyn/backend/internal/models"
	"github.com/sdyn/backend/internal/services"
)

// Global authorization service instance
var authzService *services.AuthorizationService

// InitAuthorizationService initializes the global authorization service
func InitAuthorizationService(service *services.AuthorizationService) {
	authzService = service
}

// RequirePermission middleware checks if user has specific permission
func RequirePermission(resource models.Resource, action models.Action) fiber.Handler {
	return func(c *fiber.Ctx) error {
		roles := GetUserRoles(c)

		if authzService == nil {
			log.Error().Msg("Authorization service not initialized")
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Internal Server Error",
				"message": "Authorization service not configured",
			})
		}

		if !authzService.CanAccess(roles, resource, action) {
			log.Warn().
				Strs("roles", roles).
				Str("resource", string(resource)).
				Str("action", string(action)).
				Str("user_id", GetUserID(c)).
				Msg("Permission denied")

			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":   "Forbidden",
				"message": "You don't have permission to perform this action",
				"details": fiber.Map{
					"resource": resource,
					"action":   action,
				},
			})
		}

		return c.Next()
	}
}

// RequireResourceAccess middleware checks if user can access a specific resource instance
func RequireResourceAccess(resource models.Resource) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if authzService == nil {
			return c.Next() // Skip if not initialized
		}

		// Get resource ID from path params
		resourceIDStr := c.Params("id")
		if resourceIDStr == "" {
			return c.Next() // No specific resource, let handler deal with it
		}

		resourceID, err := uuid.Parse(resourceIDStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Bad Request",
				"message": "Invalid resource ID",
			})
		}

		ctx := c.Context()
		canAccess, err := authzService.CanAccessResource(ctx, c, resource, resourceID)
		if err != nil {
			log.Error().Err(err).Msg("Failed to check resource access")
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Internal Server Error",
				"message": "Failed to check access permissions",
			})
		}

		if !canAccess {
			log.Warn().
				Str("resource", string(resource)).
				Str("resource_id", resourceIDStr).
				Str("user_id", GetUserID(c)).
				Msg("Resource access denied")

			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":   "Forbidden",
				"message": "You don't have access to this resource",
			})
		}

		return c.Next()
	}
}

// DataScope middleware adds data scoping filter to context
func DataScope() fiber.Handler {
	return func(c *fiber.Ctx) error {
		if authzService == nil {
			return c.Next()
		}

		ctx := c.Context()
		filter, err := authzService.GetDataScopeFilter(ctx, c)
		if err != nil {
			log.Error().Err(err).Msg("Failed to get data scope filter")
			return c.Next()
		}

		c.Locals("data_scope", filter)
		c.Locals("scope_level", filter.Scope)

		return c.Next()
	}
}

// GetDataScope retrieves the data scope filter from context
func GetDataScope(c *fiber.Ctx) *services.DataScopeFilter {
	filter, ok := c.Locals("data_scope").(*services.DataScopeFilter)
	if !ok {
		return nil
	}
	return filter
}

// GetScopeLevel retrieves the scope level from context
func GetScopeLevel(c *fiber.Ctx) models.Scope {
	scope, ok := c.Locals("scope_level").(models.Scope)
	if !ok {
		return models.ScopeOwn // Default to most restrictive
	}
	return scope
}

// CheckTokenBlacklist middleware checks if the token is blacklisted
func CheckTokenBlacklist() fiber.Handler {
	return func(c *fiber.Ctx) error {
		if authzService == nil {
			return c.Next()
		}

		// Get token ID (jti) from claims
		claims, ok := c.Locals("claims").(*models.KeycloakClaims)
		if !ok || claims == nil {
			return c.Next()
		}

		ctx := c.Context()

		// Check if specific token is blacklisted
		if claims.ID != "" {
			blacklisted, err := authzService.IsTokenBlacklisted(ctx, claims.ID)
			if err != nil {
				log.Error().Err(err).Msg("Failed to check token blacklist")
			} else if blacklisted {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error":   "Unauthorized",
					"message": "Token has been revoked",
				})
			}
		}

		// Check if all user tokens were invalidated
		if claims.Subject != "" && claims.IssuedAt != nil {
			invalidated, err := authzService.IsUserTokenInvalidated(ctx, claims.Subject, claims.IssuedAt.Time)
			if err != nil {
				log.Error().Err(err).Msg("Failed to check user token invalidation")
			} else if invalidated {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error":   "Unauthorized",
					"message": "Session has been invalidated. Please login again.",
				})
			}
		}

		return c.Next()
	}
}

// RBAC combines all RBAC middleware
func RBAC(resource models.Resource, action models.Action) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Check permission
		roles := GetUserRoles(c)
		if authzService != nil && !authzService.CanAccess(roles, resource, action) {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":   "Forbidden",
				"message": "You don't have permission to perform this action",
			})
		}

		// Add data scope to context
		if authzService != nil {
			ctx := c.Context()
			filter, _ := authzService.GetDataScopeFilter(ctx, c)
			if filter != nil {
				c.Locals("data_scope", filter)
				c.Locals("scope_level", filter.Scope)
			}
		}

		return c.Next()
	}
}

// RBACWithResourceCheck combines permission check with resource access check
func RBACWithResourceCheck(resource models.Resource, action models.Action) fiber.Handler {
	return func(c *fiber.Ctx) error {
		roles := GetUserRoles(c)

		if authzService == nil {
			// Fallback to basic role check
			return RequireRole(getRolesForAction(resource, action)...)(c)
		}

		// Check permission
		if !authzService.CanAccess(roles, resource, action) {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":   "Forbidden",
				"message": "You don't have permission to perform this action",
			})
		}

		// Check resource access if ID is provided
		resourceIDStr := c.Params("id")
		if resourceIDStr != "" {
			resourceID, err := uuid.Parse(resourceIDStr)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error":   "Bad Request",
					"message": "Invalid resource ID",
				})
			}

			ctx := c.Context()
			canAccess, err := authzService.CanAccessResource(ctx, c, resource, resourceID)
			if err != nil {
				log.Error().Err(err).Msg("Failed to check resource access")
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error":   "Internal Server Error",
					"message": "Failed to check access permissions",
				})
			}

			if !canAccess {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"error":   "Forbidden",
					"message": "You don't have access to this resource",
				})
			}
		}

		// Add data scope
		ctx := c.Context()
		filter, _ := authzService.GetDataScopeFilter(ctx, c)
		if filter != nil {
			c.Locals("data_scope", filter)
			c.Locals("scope_level", filter.Scope)
		}

		return c.Next()
	}
}

// getRolesForAction returns roles that can perform an action (fallback)
func getRolesForAction(resource models.Resource, action models.Action) []string {
	// Check which roles have this permission
	var roles []string
	for roleName, rolePerms := range models.PermissionMatrix {
		for _, perm := range rolePerms.Permissions {
			if perm.Resource == resource && perm.Action == action {
				roles = append(roles, roleName)
				break
			}
		}
	}
	if len(roles) == 0 {
		return []string{"national_admin"} // Default to most restrictive
	}
	return roles
}
