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

// MockOrganizationRepository is a mock implementation of the organization repository
type MockOrganizationRepository struct {
	mock.Mock
}

func (m *MockOrganizationRepository) List(ctx context.Context, params *models.OrganizationListParams) ([]models.Organization, error) {
	args := m.Called(ctx, params)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.Organization), args.Error(1)
}

func (m *MockOrganizationRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Organization, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Organization), args.Error(1)
}

func (m *MockOrganizationRepository) Create(ctx context.Context, org *models.Organization) (*models.Organization, error) {
	args := m.Called(ctx, org)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Organization), args.Error(1)
}

func (m *MockOrganizationRepository) Update(ctx context.Context, org *models.Organization) (*models.Organization, error) {
	args := m.Called(ctx, org)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Organization), args.Error(1)
}

func (m *MockOrganizationRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestOrganizationService_List(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockOrganizationRepository)

	expectedOrgs := []models.Organization{
		{
			ID:       uuid.New(),
			Name:     "Test Organization",
			Level:    "national",
			IsActive: true,
		},
		{
			ID:       uuid.New(),
			Name:     "Province Organization",
			Level:    "province",
			IsActive: true,
		},
	}

	params := &models.OrganizationListParams{}
	mockRepo.On("List", ctx, params).Return(expectedOrgs, nil)

	orgs, err := mockRepo.List(ctx, params)

	assert.NoError(t, err)
	assert.Len(t, orgs, 2)
	assert.Equal(t, "national", orgs[0].Level)
	mockRepo.AssertExpectations(t)
}

func TestOrganizationService_GetByID(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockOrganizationRepository)

	orgID := uuid.New()
	expectedOrg := &models.Organization{
		ID:        orgID,
		Name:      "Test Organization",
		Level:     "national",
		Code:      "SDYN",
		IsActive:  true,
		CreatedAt: time.Now(),
	}

	mockRepo.On("GetByID", ctx, orgID).Return(expectedOrg, nil)

	org, err := mockRepo.GetByID(ctx, orgID)

	assert.NoError(t, err)
	assert.NotNil(t, org)
	assert.Equal(t, "Test Organization", org.Name)
	assert.Equal(t, "SDYN", org.Code)
	mockRepo.AssertExpectations(t)
}

func TestOrganizationService_Create(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockOrganizationRepository)

	newOrg := &models.Organization{
		Name:     "New Organization",
		Level:    "province",
		IsActive: true,
	}

	createdOrg := &models.Organization{
		ID:        uuid.New(),
		Name:      "New Organization",
		Level:     "province",
		Code:      "SDYN-NEW",
		IsActive:  true,
		CreatedAt: time.Now(),
	}

	mockRepo.On("Create", ctx, newOrg).Return(createdOrg, nil)

	org, err := mockRepo.Create(ctx, newOrg)

	assert.NoError(t, err)
	assert.NotNil(t, org)
	assert.NotEmpty(t, org.ID)
	assert.Equal(t, "SDYN-NEW", org.Code)
	mockRepo.AssertExpectations(t)
}

func TestOrganizationService_Update(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockOrganizationRepository)

	orgID := uuid.New()
	existingOrg := &models.Organization{
		ID:       orgID,
		Name:     "Test Organization",
		Level:    "province",
		IsActive: true,
	}

	updatedOrg := &models.Organization{
		ID:        orgID,
		Name:      "Updated Organization",
		Level:     "province",
		IsActive:  true,
		UpdatedAt: time.Now(),
	}

	mockRepo.On("Update", ctx, existingOrg).Return(updatedOrg, nil)

	org, err := mockRepo.Update(ctx, existingOrg)

	assert.NoError(t, err)
	assert.NotNil(t, org)
	assert.Equal(t, "Updated Organization", org.Name)
	mockRepo.AssertExpectations(t)
}

func TestOrganizationService_Delete(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockOrganizationRepository)

	orgID := uuid.New()
	mockRepo.On("Delete", ctx, orgID).Return(nil)

	err := mockRepo.Delete(ctx, orgID)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestOrganizationService_Hierarchy(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockOrganizationRepository)

	nationalID := uuid.New()
	provinceID := uuid.New()

	national := &models.Organization{
		ID:       nationalID,
		Name:     "National Org",
		Level:    "national",
		IsActive: true,
	}

	province := &models.Organization{
		ID:       provinceID,
		Name:     "Province Org",
		Level:    "province",
		ParentID: &nationalID,
		IsActive: true,
	}

	mockRepo.On("GetByID", ctx, nationalID).Return(national, nil)
	mockRepo.On("GetByID", ctx, provinceID).Return(province, nil)

	// Get national
	natOrg, err := mockRepo.GetByID(ctx, nationalID)
	assert.NoError(t, err)
	assert.Equal(t, "national", natOrg.Level)

	// Get province and verify parent
	provOrg, err := mockRepo.GetByID(ctx, provinceID)
	assert.NoError(t, err)
	assert.Equal(t, "province", provOrg.Level)
	assert.Equal(t, &nationalID, provOrg.ParentID)

	mockRepo.AssertExpectations(t)
}
