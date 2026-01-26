package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"

	"github.com/sdyn/backend/internal/models"
)

func JWTAuth(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Missing authorization header",
			})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Invalid authorization header format",
			})
		}

		tokenString := parts[1]

		token, err := jwt.ParseWithClaims(tokenString, &models.JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid signing method")
			}
			return []byte(secret), nil
		})

		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Invalid or expired token",
			})
		}

		claims, ok := token.Claims.(*models.JWTClaims)
		if !ok || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Invalid token claims",
			})
		}

		// Store user info in context
		c.Locals("user_id", claims.UserID)
		c.Locals("member_id", claims.MemberID)
		c.Locals("email", claims.Email)
		c.Locals("roles", claims.Roles)
		c.Locals("organization_id", claims.OrganizationID)

		return c.Next()
	}
}

func RequireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRoles, ok := c.Locals("roles").([]string)
		if !ok {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":   "Forbidden",
				"message": "No roles found",
			})
		}

		for _, requiredRole := range roles {
			for _, userRole := range userRoles {
				if userRole == requiredRole || userRole == "national_admin" {
					return c.Next()
				}
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error":   "Forbidden",
			"message": "Insufficient permissions",
		})
	}
}

func GetUserID(c *fiber.Ctx) string {
	userID, _ := c.Locals("user_id").(string)
	return userID
}

func GetMemberID(c *fiber.Ctx) string {
	memberID, _ := c.Locals("member_id").(string)
	return memberID
}

func GetUserRoles(c *fiber.Ctx) []string {
	roles, _ := c.Locals("roles").([]string)
	return roles
}

func GetOrganizationID(c *fiber.Ctx) *string {
	orgID, ok := c.Locals("organization_id").(*string)
	if !ok {
		return nil
	}
	return orgID
}

func HasRole(c *fiber.Ctx, role string) bool {
	roles := GetUserRoles(c)
	for _, r := range roles {
		if r == role || r == "national_admin" {
			return true
		}
	}
	return false
}
