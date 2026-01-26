package handlers

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/sdyn/backend/internal/models"
	"github.com/sdyn/backend/internal/services"
)

type OrganizationHandler struct {
	service  *services.OrganizationService
	validate *validator.Validate
}

func NewOrganizationHandler(service *services.OrganizationService) *OrganizationHandler {
	return &OrganizationHandler{
		service:  service,
		validate: validator.New(),
	}
}

// List returns paginated list of organizations
func (h *OrganizationHandler) List(c *fiber.Ctx) error {
	params := new(models.OrganizationListParams)
	if err := c.QueryParser(params); err != nil {
		return BadRequest(c, "Invalid query parameters")
	}

	if params.Page <= 0 {
		params.Page = 1
	}
	if params.Limit <= 0 || params.Limit > 100 {
		params.Limit = 20
	}

	result, err := h.service.List(c.Context(), params)
	if err != nil {
		return InternalError(c, "Failed to fetch organizations")
	}

	return c.JSON(result)
}

// Get returns a single organization
func (h *OrganizationHandler) Get(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid organization ID")
	}

	org, err := h.service.GetByID(c.Context(), id)
	if err != nil {
		return NotFound(c, "Organization not found")
	}

	return c.JSON(org)
}

// Create creates a new organization
func (h *OrganizationHandler) Create(c *fiber.Ctx) error {
	req := new(models.CreateOrganizationRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	org, err := h.service.Create(c.Context(), req)
	if err != nil {
		return InternalError(c, "Failed to create organization: "+err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(org)
}

// Update updates an organization
func (h *OrganizationHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid organization ID")
	}

	req := new(models.UpdateOrganizationRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	org, err := h.service.Update(c.Context(), id, req)
	if err != nil {
		return InternalError(c, "Failed to update organization")
	}

	return c.JSON(org)
}

// Delete removes an organization
func (h *OrganizationHandler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid organization ID")
	}

	if err := h.service.Delete(c.Context(), id); err != nil {
		return InternalError(c, "Failed to delete organization")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// GetMembers returns members of an organization
func (h *OrganizationHandler) GetMembers(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid organization ID")
	}

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)

	members, err := h.service.GetMembers(c.Context(), id, page, limit)
	if err != nil {
		return InternalError(c, "Failed to fetch members")
	}

	return c.JSON(members)
}

// GetStats returns organization statistics
func (h *OrganizationHandler) GetStats(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid organization ID")
	}

	stats, err := h.service.GetStats(c.Context(), id)
	if err != nil {
		return InternalError(c, "Failed to fetch statistics")
	}

	return c.JSON(stats)
}

// GetProvinces returns all provinces
func (h *OrganizationHandler) GetProvinces(c *fiber.Ctx) error {
	provinces, err := h.service.GetProvinces(c.Context())
	if err != nil {
		return InternalError(c, "Failed to fetch provinces")
	}

	return c.JSON(provinces)
}

// GetDistricts returns districts by province
func (h *OrganizationHandler) GetDistricts(c *fiber.Ctx) error {
	provinceID, err := uuid.Parse(c.Params("provinceId"))
	if err != nil {
		return BadRequest(c, "Invalid province ID")
	}

	districts, err := h.service.GetDistricts(c.Context(), provinceID)
	if err != nil {
		return InternalError(c, "Failed to fetch districts")
	}

	return c.JSON(districts)
}
