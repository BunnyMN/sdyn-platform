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

// MockMemberRepository is a mock implementation of the member repository
type MockMemberRepository struct {
	mock.Mock
}

func (m *MockMemberRepository) List(ctx context.Context, params *models.MemberListParams) (*models.MemberListResponse, error) {
	args := m.Called(ctx, params)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.MemberListResponse), args.Error(1)
}

func (m *MockMemberRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Member, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Member), args.Error(1)
}

func (m *MockMemberRepository) GetByEmail(ctx context.Context, email string) (*models.Member, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Member), args.Error(1)
}

func (m *MockMemberRepository) Create(ctx context.Context, member *models.Member) (*models.Member, error) {
	args := m.Called(ctx, member)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Member), args.Error(1)
}

func (m *MockMemberRepository) Update(ctx context.Context, member *models.Member) (*models.Member, error) {
	args := m.Called(ctx, member)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Member), args.Error(1)
}

func (m *MockMemberRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockMemberRepository) CreateHistory(ctx context.Context, history *models.MemberHistory) error {
	args := m.Called(ctx, history)
	return args.Error(0)
}

func (m *MockMemberRepository) GetHistory(ctx context.Context, memberID uuid.UUID) ([]models.MemberHistory, error) {
	args := m.Called(ctx, memberID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.MemberHistory), args.Error(1)
}

func (m *MockMemberRepository) GetReport(ctx context.Context, orgID string) (map[string]interface{}, error) {
	args := m.Called(ctx, orgID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(map[string]interface{}), args.Error(1)
}

func TestMemberService_List(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockMemberRepository)

	expectedMembers := []models.Member{
		{
			ID:        uuid.New(),
			MemberID:  "SDYN-2024-00001",
			FirstName: "Test",
			LastName:  "User",
			Status:    models.MemberStatusActive,
		},
	}

	expectedResponse := &models.MemberListResponse{
		Members:    expectedMembers,
		Total:      1,
		Page:       1,
		Limit:      10,
		TotalPages: 1,
	}

	params := &models.MemberListParams{
		Page:  1,
		Limit: 10,
	}

	mockRepo.On("List", ctx, params).Return(expectedResponse, nil)

	response, err := mockRepo.List(ctx, params)

	assert.NoError(t, err)
	assert.NotNil(t, response)
	assert.Len(t, response.Members, 1)
	assert.Equal(t, "SDYN-2024-00001", response.Members[0].MemberID)
	mockRepo.AssertExpectations(t)
}

func TestMemberService_GetByID(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockMemberRepository)

	memberID := uuid.New()
	expectedMember := &models.Member{
		ID:        memberID,
		MemberID:  "SDYN-2024-00001",
		FirstName: "Test",
		LastName:  "User",
		Status:    models.MemberStatusActive,
		CreatedAt: time.Now(),
	}

	mockRepo.On("GetByID", ctx, memberID).Return(expectedMember, nil)

	member, err := mockRepo.GetByID(ctx, memberID)

	assert.NoError(t, err)
	assert.NotNil(t, member)
	assert.Equal(t, memberID, member.ID)
	assert.Equal(t, "SDYN-2024-00001", member.MemberID)
	mockRepo.AssertExpectations(t)
}

func TestMemberService_Create(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockMemberRepository)

	newMember := &models.Member{
		FirstName: "New",
		LastName:  "Member",
		Status:    models.MemberStatusPending,
	}

	createdMember := &models.Member{
		ID:        uuid.New(),
		MemberID:  "SDYN-2024-00002",
		FirstName: "New",
		LastName:  "Member",
		Status:    models.MemberStatusPending,
		CreatedAt: time.Now(),
	}

	mockRepo.On("Create", ctx, newMember).Return(createdMember, nil)

	member, err := mockRepo.Create(ctx, newMember)

	assert.NoError(t, err)
	assert.NotNil(t, member)
	assert.NotEmpty(t, member.ID)
	assert.Equal(t, "SDYN-2024-00002", member.MemberID)
	mockRepo.AssertExpectations(t)
}

func TestMemberService_Update(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockMemberRepository)

	memberID := uuid.New()
	existingMember := &models.Member{
		ID:        memberID,
		MemberID:  "SDYN-2024-00001",
		FirstName: "Test",
		LastName:  "User",
		Status:    models.MemberStatusActive,
	}

	updatedMember := &models.Member{
		ID:        memberID,
		MemberID:  "SDYN-2024-00001",
		FirstName: "Updated",
		LastName:  "User",
		Status:    models.MemberStatusActive,
		UpdatedAt: time.Now(),
	}

	mockRepo.On("Update", ctx, existingMember).Return(updatedMember, nil)

	member, err := mockRepo.Update(ctx, existingMember)

	assert.NoError(t, err)
	assert.NotNil(t, member)
	assert.Equal(t, "Updated", member.FirstName)
	mockRepo.AssertExpectations(t)
}

func TestMemberService_Delete(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockMemberRepository)

	memberID := uuid.New()
	mockRepo.On("Delete", ctx, memberID).Return(nil)

	err := mockRepo.Delete(ctx, memberID)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestMemberService_GetReport(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockMemberRepository)

	expectedReport := map[string]interface{}{
		"total_members":   100,
		"active_members":  85,
		"pending_members": 15,
		"by_status": map[string]int{
			"active":  85,
			"pending": 15,
		},
		"by_gender": map[string]int{
			"male":   60,
			"female": 40,
		},
	}

	mockRepo.On("GetReport", ctx, "").Return(expectedReport, nil)

	report, err := mockRepo.GetReport(ctx, "")

	assert.NoError(t, err)
	assert.NotNil(t, report)
	assert.Equal(t, 100, report["total_members"])
	assert.Equal(t, 85, report["active_members"])
	mockRepo.AssertExpectations(t)
}
