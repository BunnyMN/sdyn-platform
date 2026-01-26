package handlers

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/sdyn/backend/internal/middleware"
	"github.com/sdyn/backend/internal/models"
	"github.com/sdyn/backend/internal/services"
)

type MemberHandler struct {
	service  *services.MemberService
	validate *validator.Validate
}

func NewMemberHandler(service *services.MemberService) *MemberHandler {
	return &MemberHandler{
		service:  service,
		validate: validator.New(),
	}
}

// List returns paginated list of members
func (h *MemberHandler) List(c *fiber.Ctx) error {
	params := new(models.MemberListParams)
	if err := c.QueryParser(params); err != nil {
		return BadRequest(c, "Invalid query parameters")
	}

	// Default pagination
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.Limit <= 0 || params.Limit > 100 {
		params.Limit = 20
	}

	// Check organization access for non-national admins
	if !middleware.HasRole(c, "national_admin") {
		orgID := middleware.GetOrganizationID(c)
		if orgID != nil {
			params.OrganizationID = orgID
		}
	}

	result, err := h.service.List(c.Context(), params)
	if err != nil {
		return InternalError(c, "Failed to fetch members")
	}

	return c.JSON(result)
}

// Get returns a single member by ID
func (h *MemberHandler) Get(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid member ID")
	}

	member, err := h.service.GetByID(c.Context(), id)
	if err != nil {
		return NotFound(c, "Member not found")
	}

	return c.JSON(member)
}

// Create creates a new member
func (h *MemberHandler) Create(c *fiber.Ctx) error {
	req := new(models.CreateMemberRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	member, err := h.service.Create(c.Context(), req)
	if err != nil {
		return InternalError(c, "Failed to create member: "+err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(member)
}

// Update updates an existing member
func (h *MemberHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid member ID")
	}

	req := new(models.UpdateMemberRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	member, err := h.service.Update(c.Context(), id, req)
	if err != nil {
		return InternalError(c, "Failed to update member: "+err.Error())
	}

	return c.JSON(member)
}

// Delete removes a member
func (h *MemberHandler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid member ID")
	}

	if err := h.service.Delete(c.Context(), id); err != nil {
		return InternalError(c, "Failed to delete member")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// UpdateStatus updates member's status
func (h *MemberHandler) UpdateStatus(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid member ID")
	}

	req := new(models.UpdateStatusRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	changedBy := middleware.GetUserID(c)
	member, err := h.service.UpdateStatus(c.Context(), id, req, changedBy)
	if err != nil {
		return InternalError(c, "Failed to update status")
	}

	return c.JSON(member)
}

// GetHistory returns member's change history
func (h *MemberHandler) GetHistory(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid member ID")
	}

	history, err := h.service.GetHistory(c.Context(), id)
	if err != nil {
		return InternalError(c, "Failed to fetch history")
	}

	return c.JSON(history)
}

// GetProfile returns current user's profile
func (h *MemberHandler) GetProfile(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	id, err := uuid.Parse(userID)
	if err != nil {
		return BadRequest(c, "Invalid user ID")
	}

	member, err := h.service.GetByID(c.Context(), id)
	if err != nil {
		return NotFound(c, "Profile not found")
	}

	return c.JSON(member)
}

// UpdateProfile updates current user's profile
func (h *MemberHandler) UpdateProfile(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	id, err := uuid.Parse(userID)
	if err != nil {
		return BadRequest(c, "Invalid user ID")
	}

	req := new(models.UpdateMemberRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	// Users can only update certain fields
	allowedReq := &models.UpdateMemberRequest{
		Phone:     req.Phone,
		Address:   req.Address,
		AvatarURL: req.AvatarURL,
		Bio:       req.Bio,
	}

	member, err := h.service.Update(c.Context(), id, allowedReq)
	if err != nil {
		return InternalError(c, "Failed to update profile")
	}

	return c.JSON(member)
}

// Report generates member statistics report
func (h *MemberHandler) Report(c *fiber.Ctx) error {
	// Get organization ID from query or user context
	orgID := c.Query("organization_id")
	if orgID == "" && !middleware.HasRole(c, "national_admin") {
		orgID = *middleware.GetOrganizationID(c)
	}

	report, err := h.service.GetReport(c.Context(), orgID)
	if err != nil {
		return InternalError(c, "Failed to generate report")
	}

	return c.JSON(report)
}
