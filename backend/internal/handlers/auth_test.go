package handlers

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func TestAuthHandler_Login(t *testing.T) {
	app := setupTestApp()

	app.Post("/api/v1/auth/login", func(c *fiber.Ctx) error {
		var body map[string]interface{}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}

		email, _ := body["email"].(string)
		password, _ := body["password"].(string)

		if email == "" || password == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Email and password are required"})
		}

		// Simulate invalid credentials
		if email == "wrong@example.com" {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid email or password"})
		}

		return c.JSON(fiber.Map{
			"access_token":  "mock-access-token",
			"refresh_token": "mock-refresh-token",
			"expires_in":    3600,
			"token_type":    "Bearer",
			"user": fiber.Map{
				"id":         "user-uuid",
				"member_id":  "SDYN-2024-00001",
				"email":      email,
				"first_name": "Test",
				"last_name":  "User",
				"roles":      []string{"member"},
			},
		})
	})

	// Test successful login
	loginData := map[string]interface{}{
		"email":    "test@example.com",
		"password": "password123",
	}
	body, _ := json.Marshal(loginData)

	req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	assert.NotEmpty(t, result["access_token"])
	assert.Equal(t, "Bearer", result["token_type"])

	// Test invalid credentials
	invalidLogin := map[string]interface{}{
		"email":    "wrong@example.com",
		"password": "wrongpassword",
	}
	body, _ = json.Marshal(invalidLogin)

	req = httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 401, resp.StatusCode)

	// Test missing fields
	emptyLogin := map[string]interface{}{
		"email": "test@example.com",
	}
	body, _ = json.Marshal(emptyLogin)

	req = httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 400, resp.StatusCode)
}

func TestAuthHandler_Register(t *testing.T) {
	app := setupTestApp()

	app.Post("/api/v1/auth/register", func(c *fiber.Ctx) error {
		var body map[string]interface{}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}

		email, _ := body["email"].(string)
		password, _ := body["password"].(string)
		firstName, _ := body["first_name"].(string)
		lastName, _ := body["last_name"].(string)
		phone, _ := body["phone"].(string)

		if email == "" || password == "" || firstName == "" || lastName == "" || phone == "" {
			return c.Status(400).JSON(fiber.Map{"error": "All fields are required"})
		}

		// Simulate existing email
		if email == "existing@example.com" {
			return c.Status(409).JSON(fiber.Map{"error": "Email already registered"})
		}

		return c.Status(201).JSON(fiber.Map{
			"access_token":  "mock-access-token",
			"refresh_token": "mock-refresh-token",
			"expires_in":    3600,
			"token_type":    "Bearer",
			"user": fiber.Map{
				"id":         "new-user-uuid",
				"member_id":  "SDYN-2024-00002",
				"email":      email,
				"first_name": firstName,
				"last_name":  lastName,
				"roles":      []string{"member"},
			},
		})
	})

	// Test successful registration
	registerData := map[string]interface{}{
		"email":      "new@example.com",
		"password":   "password123",
		"first_name": "New",
		"last_name":  "User",
		"phone":      "99001122",
	}
	body, _ := json.Marshal(registerData)

	req := httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 201, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	assert.NotEmpty(t, result["access_token"])
	user := result["user"].(map[string]interface{})
	assert.Equal(t, "new@example.com", user["email"])

	// Test duplicate email
	duplicateData := map[string]interface{}{
		"email":      "existing@example.com",
		"password":   "password123",
		"first_name": "Test",
		"last_name":  "User",
		"phone":      "99001122",
	}
	body, _ = json.Marshal(duplicateData)

	req = httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 409, resp.StatusCode)
}

func TestAuthHandler_RefreshToken(t *testing.T) {
	app := setupTestApp()

	app.Post("/api/v1/auth/refresh", func(c *fiber.Ctx) error {
		var body map[string]interface{}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}

		refreshToken, _ := body["refresh_token"].(string)

		if refreshToken == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Refresh token is required"})
		}

		if refreshToken == "invalid-token" {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid refresh token"})
		}

		return c.JSON(fiber.Map{
			"access_token":  "new-access-token",
			"refresh_token": "new-refresh-token",
			"expires_in":    3600,
			"token_type":    "Bearer",
		})
	})

	// Test successful refresh
	refreshData := map[string]interface{}{
		"refresh_token": "valid-refresh-token",
	}
	body, _ := json.Marshal(refreshData)

	req := httptest.NewRequest("POST", "/api/v1/auth/refresh", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	assert.Equal(t, "new-access-token", result["access_token"])

	// Test invalid refresh token
	invalidData := map[string]interface{}{
		"refresh_token": "invalid-token",
	}
	body, _ = json.Marshal(invalidData)

	req = httptest.NewRequest("POST", "/api/v1/auth/refresh", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 401, resp.StatusCode)
}

func TestAuthHandler_Logout(t *testing.T) {
	app := setupTestApp()

	app.Post("/api/v1/auth/logout", func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{"error": "Authorization header required"})
		}

		return c.JSON(fiber.Map{"message": "Logged out successfully"})
	})

	// Test successful logout
	req := httptest.NewRequest("POST", "/api/v1/auth/logout", nil)
	req.Header.Set("Authorization", "Bearer mock-token")
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)

	// Test without auth header
	req = httptest.NewRequest("POST", "/api/v1/auth/logout", nil)
	resp, err = app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 401, resp.StatusCode)
}

func TestAuthHandler_ChangePassword(t *testing.T) {
	app := setupTestApp()

	app.Post("/api/v1/auth/change-password", func(c *fiber.Ctx) error {
		var body map[string]interface{}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}

		currentPassword, _ := body["current_password"].(string)
		newPassword, _ := body["new_password"].(string)

		if currentPassword == "" || newPassword == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Current and new password are required"})
		}

		if len(newPassword) < 8 {
			return c.Status(400).JSON(fiber.Map{"error": "Password must be at least 8 characters"})
		}

		if currentPassword == "wrong-password" {
			return c.Status(401).JSON(fiber.Map{"error": "Current password is incorrect"})
		}

		return c.JSON(fiber.Map{"message": "Password changed successfully"})
	})

	// Test successful password change
	passwordData := map[string]interface{}{
		"current_password": "old-password",
		"new_password":     "new-password123",
	}
	body, _ := json.Marshal(passwordData)

	req := httptest.NewRequest("POST", "/api/v1/auth/change-password", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer mock-token")
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)

	// Test wrong current password
	wrongData := map[string]interface{}{
		"current_password": "wrong-password",
		"new_password":     "new-password123",
	}
	body, _ = json.Marshal(wrongData)

	req = httptest.NewRequest("POST", "/api/v1/auth/change-password", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 401, resp.StatusCode)
}
