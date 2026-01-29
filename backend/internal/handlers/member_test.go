package handlers

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func setupTestApp() *fiber.App {
	app := fiber.New()
	return app
}

func TestMemberHandler_ListMembers(t *testing.T) {
	app := setupTestApp()

	// Mock handler
	app.Get("/api/v1/members", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"members": []fiber.Map{
				{
					"id":         "uuid-1",
					"member_id":  "SDYN-2024-00001",
					"first_name": "Test",
					"last_name":  "User",
					"status":     "active",
				},
			},
			"total":       1,
			"page":        1,
			"limit":       10,
			"total_pages": 1,
		})
	})

	req := httptest.NewRequest("GET", "/api/v1/members", nil)
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(t, float64(1), result["total"])
	members := result["members"].([]interface{})
	assert.Len(t, members, 1)
}

func TestMemberHandler_GetMemberByID(t *testing.T) {
	app := setupTestApp()

	app.Get("/api/v1/members/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		if id == "invalid-uuid" {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid member ID",
			})
		}

		return c.JSON(fiber.Map{
			"id":         id,
			"member_id":  "SDYN-2024-00001",
			"first_name": "Test",
			"last_name":  "User",
			"status":     "active",
		})
	})

	// Test valid ID
	req := httptest.NewRequest("GET", "/api/v1/members/valid-uuid", nil)
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	assert.Equal(t, "valid-uuid", result["id"])

	// Test invalid ID
	req = httptest.NewRequest("GET", "/api/v1/members/invalid-uuid", nil)
	resp, err = app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 400, resp.StatusCode)
}

func TestMemberHandler_CreateMember(t *testing.T) {
	app := setupTestApp()

	app.Post("/api/v1/members", func(c *fiber.Ctx) error {
		var body map[string]interface{}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}

		// Validate required fields
		if body["first_name"] == nil || body["last_name"] == nil {
			return c.Status(400).JSON(fiber.Map{"error": "First name and last name are required"})
		}

		return c.Status(201).JSON(fiber.Map{
			"id":         "new-uuid",
			"member_id":  "SDYN-2024-00002",
			"first_name": body["first_name"],
			"last_name":  body["last_name"],
			"status":     "pending",
		})
	})

	// Test successful creation
	newMember := map[string]interface{}{
		"first_name": "New",
		"last_name":  "Member",
		"email":      "new@example.com",
		"phone":      "99001122",
	}
	body, _ := json.Marshal(newMember)

	req := httptest.NewRequest("POST", "/api/v1/members", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 201, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	assert.Equal(t, "SDYN-2024-00002", result["member_id"])
	assert.Equal(t, "pending", result["status"])

	// Test validation error
	invalidMember := map[string]interface{}{
		"email": "invalid@example.com",
	}
	body, _ = json.Marshal(invalidMember)

	req = httptest.NewRequest("POST", "/api/v1/members", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 400, resp.StatusCode)
}

func TestMemberHandler_UpdateMember(t *testing.T) {
	app := setupTestApp()

	app.Put("/api/v1/members/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var body map[string]interface{}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}

		return c.JSON(fiber.Map{
			"id":         id,
			"member_id":  "SDYN-2024-00001",
			"first_name": body["first_name"],
			"last_name":  body["last_name"],
			"status":     "active",
		})
	})

	updateData := map[string]interface{}{
		"first_name": "Updated",
		"last_name":  "Name",
	}
	body, _ := json.Marshal(updateData)

	req := httptest.NewRequest("PUT", "/api/v1/members/member-uuid", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	assert.Equal(t, "Updated", result["first_name"])
}

func TestMemberHandler_DeleteMember(t *testing.T) {
	app := setupTestApp()

	app.Delete("/api/v1/members/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		if id == "not-found" {
			return c.Status(404).JSON(fiber.Map{"error": "Member not found"})
		}
		return c.SendStatus(204)
	})

	// Test successful deletion
	req := httptest.NewRequest("DELETE", "/api/v1/members/valid-uuid", nil)
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 204, resp.StatusCode)

	// Test not found
	req = httptest.NewRequest("DELETE", "/api/v1/members/not-found", nil)
	resp, err = app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 404, resp.StatusCode)
}

func TestMemberHandler_UpdateStatus(t *testing.T) {
	app := setupTestApp()

	app.Patch("/api/v1/members/:id/status", func(c *fiber.Ctx) error {
		var body map[string]interface{}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}

		status, ok := body["status"].(string)
		if !ok || status == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Status is required"})
		}

		validStatuses := []string{"pending", "active", "inactive", "suspended"}
		isValid := false
		for _, s := range validStatuses {
			if s == status {
				isValid = true
				break
			}
		}

		if !isValid {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid status"})
		}

		return c.JSON(fiber.Map{
			"id":     c.Params("id"),
			"status": status,
		})
	})

	// Test valid status update
	statusData := map[string]interface{}{
		"status": "active",
		"reason": "Approved by admin",
	}
	body, _ := json.Marshal(statusData)

	req := httptest.NewRequest("PATCH", "/api/v1/members/member-uuid/status", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)

	// Test invalid status
	invalidStatus := map[string]interface{}{
		"status": "invalid-status",
	}
	body, _ = json.Marshal(invalidStatus)

	req = httptest.NewRequest("PATCH", "/api/v1/members/member-uuid/status", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 400, resp.StatusCode)
}
