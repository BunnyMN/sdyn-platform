package handlers

import (
	"github.com/gofiber/fiber/v2"

	"github.com/sdyn/backend/internal/models"
	"github.com/sdyn/backend/internal/services"
)

// GetAuditLogs returns recent audit logs
func GetAuditLogs(authzService *services.AuthorizationService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()

		// Get limit from query params (default 100)
		limit := c.QueryInt("limit", 100)
		if limit > 1000 {
			limit = 1000
		}

		logs, err := authzService.GetRecentAuditLogs(ctx, int64(limit))
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "Internal Server Error",
				"message": "Failed to retrieve audit logs",
			})
		}

		return c.JSON(fiber.Map{
			"logs":  logs,
			"count": len(logs),
			"limit": limit,
		})
	}
}

// GetPermissionMatrix returns the RBAC permission matrix
func GetPermissionMatrix(c *fiber.Ctx) error {
	// Transform permission matrix for frontend consumption
	matrix := make(map[string]interface{})

	for roleName, rolePerms := range models.PermissionMatrix {
		permissions := make([]map[string]string, 0, len(rolePerms.Permissions))
		for _, perm := range rolePerms.Permissions {
			permissions = append(permissions, map[string]string{
				"resource": string(perm.Resource),
				"action":   string(perm.Action),
			})
		}

		matrix[roleName] = map[string]interface{}{
			"role":        roleName,
			"scope":       rolePerms.Scope,
			"permissions": permissions,
		}
	}

	// Also return available resources and actions
	resources := []string{
		string(models.ResourceMember),
		string(models.ResourceOrganization),
		string(models.ResourceEvent),
		string(models.ResourceFee),
		string(models.ResourceReport),
		string(models.ResourcePosition),
		string(models.ResourceProvince),
		string(models.ResourceDistrict),
		string(models.ResourceSettings),
	}

	actions := []string{
		string(models.ActionCreate),
		string(models.ActionRead),
		string(models.ActionUpdate),
		string(models.ActionDelete),
		string(models.ActionList),
		string(models.ActionExport),
		string(models.ActionImport),
		string(models.ActionApprove),
		string(models.ActionReject),
	}

	scopes := []string{
		string(models.ScopeAll),
		string(models.ScopeProvince),
		string(models.ScopeDistrict),
		string(models.ScopeOwn),
	}

	return c.JSON(fiber.Map{
		"matrix":    matrix,
		"resources": resources,
		"actions":   actions,
		"scopes":    scopes,
	})
}

// CheckPermission checks if the current user has a specific permission
func CheckPermission(authzService *services.AuthorizationService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		resource := models.Resource(c.Query("resource"))
		action := models.Action(c.Query("action"))

		if resource == "" || action == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Bad Request",
				"message": "resource and action query parameters are required",
			})
		}

		roles, _ := c.Locals("roles").([]string)
		hasPermission := authzService.CanAccess(roles, resource, action)
		scope := authzService.GetScope(roles)

		return c.JSON(fiber.Map{
			"resource":       resource,
			"action":         action,
			"has_permission": hasPermission,
			"scope":          scope,
			"roles":          roles,
		})
	}
}
