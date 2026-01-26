package services

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/sdyn/backend/internal/models"
	"github.com/sdyn/backend/internal/repository"
)

type EventService struct {
	repo *repository.EventRepository
}

func NewEventService(repo *repository.EventRepository) *EventService {
	return &EventService{repo: repo}
}

func (s *EventService) List(ctx context.Context, params *models.EventListParams) ([]models.Event, error) {
	return s.repo.List(ctx, params)
}

func (s *EventService) GetByID(ctx context.Context, id uuid.UUID) (*models.Event, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *EventService) Create(ctx context.Context, req *models.CreateEventRequest, organizerID string) (*models.Event, error) {
	startDate, err := time.Parse(time.RFC3339, req.StartDate)
	if err != nil {
		return nil, err
	}

	event := &models.Event{
		Title:     req.Title,
		Type:      req.Type,
		Status:    models.EventStatusDraft,
		StartDate: startDate,
		IsOnline:  req.IsOnline,
		IsPublic:  req.IsPublic,
	}

	if req.Description != nil {
		event.Description = req.Description
	}
	if req.EndDate != nil {
		endDate, err := time.Parse(time.RFC3339, *req.EndDate)
		if err == nil {
			event.EndDate = &endDate
		}
	}
	if req.Location != nil {
		event.Location = req.Location
	}
	if req.Address != nil {
		event.Address = req.Address
	}
	if req.OnlineURL != nil {
		event.OnlineURL = req.OnlineURL
	}
	if req.MaxParticipants != nil {
		event.MaxParticipants = req.MaxParticipants
	}
	if req.RegistrationDeadline != nil {
		deadline, err := time.Parse(time.RFC3339, *req.RegistrationDeadline)
		if err == nil {
			event.RegistrationDeadline = &deadline
		}
	}
	if req.CoverImageURL != nil {
		event.CoverImageURL = req.CoverImageURL
	}

	// Parse organization ID
	if req.OrganizationID != nil {
		id, err := uuid.Parse(*req.OrganizationID)
		if err == nil {
			event.OrganizationID = &id
		}
	}

	// Set organizer
	orgID, err := uuid.Parse(organizerID)
	if err == nil {
		event.OrganizerID = &orgID
	}

	return s.repo.Create(ctx, event)
}

func (s *EventService) Update(ctx context.Context, id uuid.UUID, req *models.UpdateEventRequest) (*models.Event, error) {
	event, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Title != nil {
		event.Title = *req.Title
	}
	if req.Description != nil {
		event.Description = req.Description
	}
	if req.Type != nil {
		event.Type = *req.Type
	}
	if req.Status != nil {
		event.Status = *req.Status
	}
	if req.StartDate != nil {
		startDate, err := time.Parse(time.RFC3339, *req.StartDate)
		if err == nil {
			event.StartDate = startDate
		}
	}
	if req.EndDate != nil {
		endDate, err := time.Parse(time.RFC3339, *req.EndDate)
		if err == nil {
			event.EndDate = &endDate
		}
	}
	if req.Location != nil {
		event.Location = req.Location
	}
	if req.Address != nil {
		event.Address = req.Address
	}
	if req.IsOnline != nil {
		event.IsOnline = *req.IsOnline
	}
	if req.OnlineURL != nil {
		event.OnlineURL = req.OnlineURL
	}
	if req.MaxParticipants != nil {
		event.MaxParticipants = req.MaxParticipants
	}
	if req.RegistrationDeadline != nil {
		deadline, err := time.Parse(time.RFC3339, *req.RegistrationDeadline)
		if err == nil {
			event.RegistrationDeadline = &deadline
		}
	}
	if req.IsPublic != nil {
		event.IsPublic = *req.IsPublic
	}
	if req.CoverImageURL != nil {
		event.CoverImageURL = req.CoverImageURL
	}

	return s.repo.Update(ctx, event)
}

func (s *EventService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *EventService) RegisterParticipant(ctx context.Context, eventID, memberID uuid.UUID) error {
	// Check if event exists and registration is open
	event, err := s.repo.GetByID(ctx, eventID)
	if err != nil {
		return err
	}

	// Check deadline
	if event.RegistrationDeadline != nil && time.Now().After(*event.RegistrationDeadline) {
		return &EventError{Message: "Registration deadline has passed"}
	}

	// Check max participants
	if event.MaxParticipants != nil {
		count, err := s.repo.CountParticipants(ctx, eventID)
		if err != nil {
			return err
		}
		if count >= *event.MaxParticipants {
			return &EventError{Message: "Event is full"}
		}
	}

	return s.repo.RegisterParticipant(ctx, eventID, memberID)
}

func (s *EventService) MarkAttendance(ctx context.Context, eventID uuid.UUID, req *models.MarkAttendanceRequest) error {
	for _, memberIDStr := range req.MemberIDs {
		memberID, err := uuid.Parse(memberIDStr)
		if err != nil {
			continue
		}
		if err := s.repo.MarkAttendance(ctx, eventID, memberID, req.Attended); err != nil {
			return err
		}
	}
	return nil
}

func (s *EventService) GetParticipants(ctx context.Context, eventID uuid.UUID) ([]models.EventParticipant, error) {
	return s.repo.GetParticipants(ctx, eventID)
}

func (s *EventService) GetMemberEvents(ctx context.Context, memberID uuid.UUID) ([]models.Event, error) {
	return s.repo.GetMemberEvents(ctx, memberID)
}

func (s *EventService) GetReport(ctx context.Context, orgID, startDate, endDate string) (map[string]interface{}, error) {
	return s.repo.GetReport(ctx, orgID, startDate, endDate)
}

type EventError struct {
	Message string
}

func (e *EventError) Error() string {
	return e.Message
}
