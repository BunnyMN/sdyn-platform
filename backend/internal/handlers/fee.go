package handlers

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/sdyn/backend/internal/middleware"
	"github.com/sdyn/backend/internal/models"
	"github.com/sdyn/backend/internal/services"
)

type FeeHandler struct {
	service  *services.FeeService
	validate *validator.Validate
}

func NewFeeHandler(service *services.FeeService) *FeeHandler {
	return &FeeHandler{
		service:  service,
		validate: validator.New(),
	}
}

// List returns paginated list of fees
func (h *FeeHandler) List(c *fiber.Ctx) error {
	params := new(models.FeeListParams)
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
		return InternalError(c, "Failed to fetch fees")
	}

	return c.JSON(result)
}

// Get returns a single fee
func (h *FeeHandler) Get(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid fee ID")
	}

	fee, err := h.service.GetByID(c.Context(), id)
	if err != nil {
		return NotFound(c, "Fee not found")
	}

	return c.JSON(fee)
}

// Create creates a new fee record
func (h *FeeHandler) Create(c *fiber.Ctx) error {
	req := new(models.CreateFeeRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	fee, err := h.service.Create(c.Context(), req)
	if err != nil {
		return InternalError(c, "Failed to create fee: "+err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(fee)
}

// Update updates a fee record
func (h *FeeHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid fee ID")
	}

	req := new(models.UpdateFeeRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	fee, err := h.service.Update(c.Context(), id, req)
	if err != nil {
		return InternalError(c, "Failed to update fee")
	}

	return c.JSON(fee)
}

// GetByMember returns fees for a specific member
func (h *FeeHandler) GetByMember(c *fiber.Ctx) error {
	memberID, err := uuid.Parse(c.Params("memberId"))
	if err != nil {
		return BadRequest(c, "Invalid member ID")
	}

	fees, err := h.service.GetByMember(c.Context(), memberID)
	if err != nil {
		return InternalError(c, "Failed to fetch fees")
	}

	return c.JSON(fees)
}

// GetMyFees returns current user's fees
func (h *FeeHandler) GetMyFees(c *fiber.Ctx) error {
	memberID := middleware.GetUserID(c)
	mID, err := uuid.Parse(memberID)
	if err != nil {
		return BadRequest(c, "Invalid member ID")
	}

	fees, err := h.service.GetByMember(c.Context(), mID)
	if err != nil {
		return InternalError(c, "Failed to fetch fees")
	}

	return c.JSON(fees)
}

// BulkCreate creates fee records for multiple members
func (h *FeeHandler) BulkCreate(c *fiber.Ctx) error {
	req := new(models.BulkCreateFeeRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	result, err := h.service.BulkCreate(c.Context(), req)
	if err != nil {
		return InternalError(c, "Failed to create fees: "+err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Fees created successfully",
		"created": result,
	})
}

// Report generates fee statistics report
func (h *FeeHandler) Report(c *fiber.Ctx) error {
	orgID := c.Query("organization_id")
	year := c.QueryInt("year", 0)

	report, err := h.service.GetReport(c.Context(), orgID, year)
	if err != nil {
		return InternalError(c, "Failed to generate report")
	}

	return c.JSON(report)
}
