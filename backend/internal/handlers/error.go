package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rs/zerolog/log"
)

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Code    int    `json:"code,omitempty"`
}

func ErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "Internal Server Error"

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}

	log.Error().
		Err(err).
		Int("status", code).
		Str("path", c.Path()).
		Str("method", c.Method()).
		Msg("Request error")

	return c.Status(code).JSON(ErrorResponse{
		Error:   getErrorName(code),
		Message: message,
		Code:    code,
	})
}

func getErrorName(code int) string {
	switch code {
	case fiber.StatusBadRequest:
		return "Bad Request"
	case fiber.StatusUnauthorized:
		return "Unauthorized"
	case fiber.StatusForbidden:
		return "Forbidden"
	case fiber.StatusNotFound:
		return "Not Found"
	case fiber.StatusConflict:
		return "Conflict"
	case fiber.StatusUnprocessableEntity:
		return "Unprocessable Entity"
	case fiber.StatusTooManyRequests:
		return "Too Many Requests"
	default:
		return "Internal Server Error"
	}
}

func BadRequest(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
		Error:   "Bad Request",
		Message: message,
		Code:    fiber.StatusBadRequest,
	})
}

func NotFound(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusNotFound).JSON(ErrorResponse{
		Error:   "Not Found",
		Message: message,
		Code:    fiber.StatusNotFound,
	})
}

func Unauthorized(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusUnauthorized).JSON(ErrorResponse{
		Error:   "Unauthorized",
		Message: message,
		Code:    fiber.StatusUnauthorized,
	})
}

func Forbidden(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusForbidden).JSON(ErrorResponse{
		Error:   "Forbidden",
		Message: message,
		Code:    fiber.StatusForbidden,
	})
}

func InternalError(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
		Error:   "Internal Server Error",
		Message: message,
		Code:    fiber.StatusInternalServerError,
	})
}

func ValidationError(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusUnprocessableEntity).JSON(ErrorResponse{
		Error:   "Validation Error",
		Message: message,
		Code:    fiber.StatusUnprocessableEntity,
	})
}
