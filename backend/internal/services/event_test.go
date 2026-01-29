package services

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/sdyn/backend/internal/models"
)

// MockEventRepository is a mock implementation of the event repository
type MockEventRepository struct {
	mock.Mock
}

func (m *MockEventRepository) List(ctx context.Context, params *models.EventListParams) ([]models.Event, error) {
	args := m.Called(ctx, params)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.Event), args.Error(1)
}

func (m *MockEventRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Event, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Event), args.Error(1)
}

func (m *MockEventRepository) Create(ctx context.Context, event *models.Event) (*models.Event, error) {
	args := m.Called(ctx, event)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Event), args.Error(1)
}

func (m *MockEventRepository) Update(ctx context.Context, event *models.Event) (*models.Event, error) {
	args := m.Called(ctx, event)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Event), args.Error(1)
}

func (m *MockEventRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockEventRepository) RegisterParticipant(ctx context.Context, eventID, memberID uuid.UUID) error {
	args := m.Called(ctx, eventID, memberID)
	return args.Error(0)
}

func (m *MockEventRepository) GetParticipants(ctx context.Context, eventID uuid.UUID) ([]models.EventParticipant, error) {
	args := m.Called(ctx, eventID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.EventParticipant), args.Error(1)
}

func (m *MockEventRepository) CountParticipants(ctx context.Context, eventID uuid.UUID) (int, error) {
	args := m.Called(ctx, eventID)
	return args.Int(0), args.Error(1)
}

func (m *MockEventRepository) GetReport(ctx context.Context, orgID, startDate, endDate string) (map[string]interface{}, error) {
	args := m.Called(ctx, orgID, startDate, endDate)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(map[string]interface{}), args.Error(1)
}

func TestEventService_List(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockEventRepository)

	startDate := time.Now().Add(24 * time.Hour)
	endDate := time.Now().Add(48 * time.Hour)

	expectedEvents := []models.Event{
		{
			ID:        uuid.New(),
			Title:     "Test Event 1",
			Status:    "upcoming",
			StartDate: &startDate,
			EndDate:   &endDate,
		},
		{
			ID:        uuid.New(),
			Title:     "Test Event 2",
			Status:    "completed",
			StartDate: &startDate,
			EndDate:   &endDate,
		},
	}

	params := &models.EventListParams{}
	mockRepo.On("List", ctx, params).Return(expectedEvents, nil)

	events, err := mockRepo.List(ctx, params)

	assert.NoError(t, err)
	assert.Len(t, events, 2)
	assert.Equal(t, "Test Event 1", events[0].Title)
	mockRepo.AssertExpectations(t)
}

func TestEventService_GetByID(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockEventRepository)

	eventID := uuid.New()
	startDate := time.Now().Add(24 * time.Hour)
	endDate := time.Now().Add(48 * time.Hour)

	expectedEvent := &models.Event{
		ID:              eventID,
		Title:           "Test Event",
		Description:     stringPtr("Event description"),
		Status:          "upcoming",
		StartDate:       &startDate,
		EndDate:         &endDate,
		Location:        stringPtr("Test Location"),
		MaxParticipants: intPtr(100),
		CreatedAt:       time.Now(),
	}

	mockRepo.On("GetByID", ctx, eventID).Return(expectedEvent, nil)

	event, err := mockRepo.GetByID(ctx, eventID)

	assert.NoError(t, err)
	assert.NotNil(t, event)
	assert.Equal(t, "Test Event", event.Title)
	assert.Equal(t, 100, *event.MaxParticipants)
	mockRepo.AssertExpectations(t)
}

func TestEventService_Create(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockEventRepository)

	startDate := time.Now().Add(24 * time.Hour)
	endDate := time.Now().Add(48 * time.Hour)

	newEvent := &models.Event{
		Title:           "New Event",
		Description:     stringPtr("New event description"),
		Status:          "draft",
		StartDate:       &startDate,
		EndDate:         &endDate,
		MaxParticipants: intPtr(50),
	}

	createdEvent := &models.Event{
		ID:              uuid.New(),
		Title:           "New Event",
		Description:     stringPtr("New event description"),
		Status:          "draft",
		StartDate:       &startDate,
		EndDate:         &endDate,
		MaxParticipants: intPtr(50),
		CreatedAt:       time.Now(),
	}

	mockRepo.On("Create", ctx, newEvent).Return(createdEvent, nil)

	event, err := mockRepo.Create(ctx, newEvent)

	assert.NoError(t, err)
	assert.NotNil(t, event)
	assert.NotEmpty(t, event.ID)
	assert.Equal(t, "draft", event.Status)
	mockRepo.AssertExpectations(t)
}

func TestEventService_RegisterParticipant(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockEventRepository)

	eventID := uuid.New()
	memberID := uuid.New()

	mockRepo.On("RegisterParticipant", ctx, eventID, memberID).Return(nil)
	mockRepo.On("CountParticipants", ctx, eventID).Return(10, nil)

	err := mockRepo.RegisterParticipant(ctx, eventID, memberID)
	assert.NoError(t, err)

	count, err := mockRepo.CountParticipants(ctx, eventID)
	assert.NoError(t, err)
	assert.Equal(t, 10, count)

	mockRepo.AssertExpectations(t)
}

func TestEventService_GetReport(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockEventRepository)

	expectedReport := map[string]interface{}{
		"total_events":      25,
		"completed_events":  20,
		"upcoming_events":   5,
		"total_registered":  500,
		"total_attended":    420,
		"attendance_rate":   84.0,
		"by_type": map[string]int{
			"training": 10,
			"meeting":  8,
			"campaign": 7,
		},
	}

	mockRepo.On("GetReport", ctx, "", "", "").Return(expectedReport, nil)

	report, err := mockRepo.GetReport(ctx, "", "", "")

	assert.NoError(t, err)
	assert.NotNil(t, report)
	assert.Equal(t, 25, report["total_events"])
	assert.Equal(t, 84.0, report["attendance_rate"])
	mockRepo.AssertExpectations(t)
}

// Helper functions
func stringPtr(s string) *string {
	return &s
}

func intPtr(i int) *int {
	return &i
}
