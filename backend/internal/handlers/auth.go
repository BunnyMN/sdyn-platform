package handlers

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"

	"github.com/sdyn/backend/internal/models"
	"github.com/sdyn/backend/internal/services"
)

type AuthHandler struct {
	service  *services.AuthService
	validate *validator.Validate
}

func NewAuthHandler(service *services.AuthService) *AuthHandler {
	return &AuthHandler{
		service:  service,
		validate: validator.New(),
	}
}

// Login authenticates a user
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	req := new(models.LoginRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	response, err := h.service.Login(c.Context(), req)
	if err != nil {
		return Unauthorized(c, "Invalid email or password")
	}

	return c.JSON(response)
}

// Register creates a new user account
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	req := new(models.RegisterRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	response, err := h.service.Register(c.Context(), req)
	if err != nil {
		return InternalError(c, "Registration failed: "+err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}

// RefreshToken refreshes access token
func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	req := new(models.RefreshTokenRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	response, err := h.service.RefreshToken(c.Context(), req.RefreshToken)
	if err != nil {
		return Unauthorized(c, "Invalid refresh token")
	}

	return c.JSON(response)
}

// Logout invalidates the user's session
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.SendStatus(fiber.StatusNoContent)
	}

	if err := h.service.Logout(c.Context(), authHeader); err != nil {
		// Log error but don't fail the logout
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// ChangePassword changes user's password
func (h *AuthHandler) ChangePassword(c *fiber.Ctx) error {
	req := new(models.ChangePasswordRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	userID, _ := c.Locals("user_id").(string)
	if err := h.service.ChangePassword(c.Context(), userID, req); err != nil {
		return BadRequest(c, err.Error())
	}

	return c.JSON(fiber.Map{
		"message": "Password changed successfully",
	})
}

// ResetPassword initiates password reset
func (h *AuthHandler) ResetPassword(c *fiber.Ctx) error {
	req := new(models.ResetPasswordRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	if err := h.service.InitiatePasswordReset(c.Context(), req.Email); err != nil {
		// Don't reveal if email exists
	}

	return c.JSON(fiber.Map{
		"message": "If the email exists, a password reset link has been sent",
	})
}

// ConfirmResetPassword completes password reset
func (h *AuthHandler) ConfirmResetPassword(c *fiber.Ctx) error {
	req := new(models.ConfirmResetPasswordRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	if err := h.service.ConfirmPasswordReset(c.Context(), req); err != nil {
		return BadRequest(c, "Invalid or expired reset token")
	}

	return c.JSON(fiber.Map{
		"message": "Password has been reset successfully",
	})
}
