package handlers

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/sdyn/backend/internal/middleware"
	"github.com/sdyn/backend/internal/models"
	"github.com/sdyn/backend/internal/services"
)

type EventHandler struct {
	service  *services.EventService
	validate *validator.Validate
}

func NewEventHandler(service *services.EventService) *EventHandler {
	return &EventHandler{
		service:  service,
		validate: validator.New(),
	}
}

// List returns paginated list of events
func (h *EventHandler) List(c *fiber.Ctx) error {
	params := new(models.EventListParams)
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
		return InternalError(c, "Failed to fetch events")
	}

	return c.JSON(result)
}

// Get returns a single event
func (h *EventHandler) Get(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid event ID")
	}

	event, err := h.service.GetByID(c.Context(), id)
	if err != nil {
		return NotFound(c, "Event not found")
	}

	return c.JSON(event)
}

// Create creates a new event
func (h *EventHandler) Create(c *fiber.Ctx) error {
	req := new(models.CreateEventRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	organizerID := middleware.GetUserID(c)
	event, err := h.service.Create(c.Context(), req, organizerID)
	if err != nil {
		return InternalError(c, "Failed to create event: "+err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(event)
}

// Update updates an event
func (h *EventHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid event ID")
	}

	req := new(models.UpdateEventRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	event, err := h.service.Update(c.Context(), id, req)
	if err != nil {
		return InternalError(c, "Failed to update event")
	}

	return c.JSON(event)
}

// Delete removes an event
func (h *EventHandler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid event ID")
	}

	if err := h.service.Delete(c.Context(), id); err != nil {
		return InternalError(c, "Failed to delete event")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// Register registers current user for an event
func (h *EventHandler) Register(c *fiber.Ctx) error {
	eventID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid event ID")
	}

	memberID := middleware.GetUserID(c)
	mID, err := uuid.Parse(memberID)
	if err != nil {
		return BadRequest(c, "Invalid member ID")
	}

	if err := h.service.RegisterParticipant(c.Context(), eventID, mID); err != nil {
		return InternalError(c, "Failed to register: "+err.Error())
	}

	return c.JSON(fiber.Map{
		"message": "Successfully registered for event",
	})
}

// MarkAttendance marks attendance for participants
func (h *EventHandler) MarkAttendance(c *fiber.Ctx) error {
	eventID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid event ID")
	}

	req := new(models.MarkAttendanceRequest)
	if err := c.BodyParser(req); err != nil {
		return BadRequest(c, "Invalid request body")
	}

	if err := h.validate.Struct(req); err != nil {
		return ValidationError(c, err.Error())
	}

	if err := h.service.MarkAttendance(c.Context(), eventID, req); err != nil {
		return InternalError(c, "Failed to mark attendance")
	}

	return c.JSON(fiber.Map{
		"message": "Attendance marked successfully",
	})
}

// GetParticipants returns event participants
func (h *EventHandler) GetParticipants(c *fiber.Ctx) error {
	eventID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return BadRequest(c, "Invalid event ID")
	}

	participants, err := h.service.GetParticipants(c.Context(), eventID)
	if err != nil {
		return InternalError(c, "Failed to fetch participants")
	}

	return c.JSON(participants)
}

// GetMyEvents returns events for current user
func (h *EventHandler) GetMyEvents(c *fiber.Ctx) error {
	memberID := middleware.GetUserID(c)
	mID, err := uuid.Parse(memberID)
	if err != nil {
		return BadRequest(c, "Invalid member ID")
	}

	events, err := h.service.GetMemberEvents(c.Context(), mID)
	if err != nil {
		return InternalError(c, "Failed to fetch events")
	}

	return c.JSON(events)
}

// Report generates event statistics report
func (h *EventHandler) Report(c *fiber.Ctx) error {
	orgID := c.Query("organization_id")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	report, err := h.service.GetReport(c.Context(), orgID, startDate, endDate)
	if err != nil {
		return InternalError(c, "Failed to generate report")
	}

	return c.JSON(report)
}
