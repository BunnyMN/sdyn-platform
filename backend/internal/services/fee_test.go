package services

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/sdyn/backend/internal/models"
)

// MockFeeRepository is a mock implementation of the fee repository
type MockFeeRepository struct {
	mock.Mock
}

func (m *MockFeeRepository) List(ctx context.Context, params *models.FeeListParams) ([]models.MembershipFee, error) {
	args := m.Called(ctx, params)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.MembershipFee), args.Error(1)
}

func (m *MockFeeRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.MembershipFee, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.MembershipFee), args.Error(1)
}

func (m *MockFeeRepository) GetByMemberAndYear(ctx context.Context, memberID uuid.UUID, year int) (*models.MembershipFee, error) {
	args := m.Called(ctx, memberID, year)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.MembershipFee), args.Error(1)
}

func (m *MockFeeRepository) Create(ctx context.Context, fee *models.MembershipFee) (*models.MembershipFee, error) {
	args := m.Called(ctx, fee)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.MembershipFee), args.Error(1)
}

func (m *MockFeeRepository) Update(ctx context.Context, fee *models.MembershipFee) (*models.MembershipFee, error) {
	args := m.Called(ctx, fee)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.MembershipFee), args.Error(1)
}

func (m *MockFeeRepository) MarkAsPaid(ctx context.Context, id uuid.UUID, paymentMethod string) error {
	args := m.Called(ctx, id, paymentMethod)
	return args.Error(0)
}

func (m *MockFeeRepository) GetMemberFees(ctx context.Context, memberID uuid.UUID) ([]models.MembershipFee, error) {
	args := m.Called(ctx, memberID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.MembershipFee), args.Error(1)
}

func TestFeeService_List(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockFeeRepository)

	memberID := uuid.New()
	expectedFees := []models.MembershipFee{
		{
			ID:       uuid.New(),
			MemberID: memberID,
			Year:     2024,
			Amount:   decimal.NewFromInt(50000),
			Status:   "pending",
		},
		{
			ID:       uuid.New(),
			MemberID: memberID,
			Year:     2023,
			Amount:   decimal.NewFromInt(50000),
			Status:   "paid",
		},
	}

	params := &models.FeeListParams{Year: 2024}
	mockRepo.On("List", ctx, params).Return(expectedFees, nil)

	fees, err := mockRepo.List(ctx, params)

	assert.NoError(t, err)
	assert.Len(t, fees, 2)
	assert.Equal(t, 2024, fees[0].Year)
	mockRepo.AssertExpectations(t)
}

func TestFeeService_GetByID(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockFeeRepository)

	feeID := uuid.New()
	memberID := uuid.New()

	expectedFee := &models.MembershipFee{
		ID:       feeID,
		MemberID: memberID,
		Year:     2024,
		Amount:   decimal.NewFromInt(50000),
		Status:   "pending",
	}

	mockRepo.On("GetByID", ctx, feeID).Return(expectedFee, nil)

	fee, err := mockRepo.GetByID(ctx, feeID)

	assert.NoError(t, err)
	assert.NotNil(t, fee)
	assert.Equal(t, 2024, fee.Year)
	assert.Equal(t, "pending", fee.Status)
	mockRepo.AssertExpectations(t)
}

func TestFeeService_Create(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockFeeRepository)

	memberID := uuid.New()
	newFee := &models.MembershipFee{
		MemberID: memberID,
		Year:     2024,
		Amount:   decimal.NewFromInt(50000),
		Status:   "pending",
	}

	createdFee := &models.MembershipFee{
		ID:        uuid.New(),
		MemberID:  memberID,
		Year:      2024,
		Amount:    decimal.NewFromInt(50000),
		Status:    "pending",
		CreatedAt: time.Now(),
	}

	mockRepo.On("Create", ctx, newFee).Return(createdFee, nil)

	fee, err := mockRepo.Create(ctx, newFee)

	assert.NoError(t, err)
	assert.NotNil(t, fee)
	assert.NotEmpty(t, fee.ID)
	assert.Equal(t, "pending", fee.Status)
	mockRepo.AssertExpectations(t)
}

func TestFeeService_MarkAsPaid(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockFeeRepository)

	feeID := uuid.New()
	paymentMethod := "bank_transfer"

	mockRepo.On("MarkAsPaid", ctx, feeID, paymentMethod).Return(nil)

	err := mockRepo.MarkAsPaid(ctx, feeID, paymentMethod)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestFeeService_GetMemberFees(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockFeeRepository)

	memberID := uuid.New()
	paidAt := time.Now().Add(-30 * 24 * time.Hour)

	expectedFees := []models.MembershipFee{
		{
			ID:       uuid.New(),
			MemberID: memberID,
			Year:     2024,
			Amount:   decimal.NewFromInt(50000),
			Status:   "pending",
		},
		{
			ID:       uuid.New(),
			MemberID: memberID,
			Year:     2023,
			Amount:   decimal.NewFromInt(50000),
			Status:   "paid",
			PaidAt:   &paidAt,
		},
		{
			ID:       uuid.New(),
			MemberID: memberID,
			Year:     2022,
			Amount:   decimal.NewFromInt(45000),
			Status:   "paid",
			PaidAt:   &paidAt,
		},
	}

	mockRepo.On("GetMemberFees", ctx, memberID).Return(expectedFees, nil)

	fees, err := mockRepo.GetMemberFees(ctx, memberID)

	assert.NoError(t, err)
	assert.Len(t, fees, 3)

	// Verify we have one pending and two paid
	pendingCount := 0
	paidCount := 0
	for _, f := range fees {
		if f.Status == "pending" {
			pendingCount++
		} else if f.Status == "paid" {
			paidCount++
		}
	}
	assert.Equal(t, 1, pendingCount)
	assert.Equal(t, 2, paidCount)

	mockRepo.AssertExpectations(t)
}

func TestFeeService_GetByMemberAndYear(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockFeeRepository)

	memberID := uuid.New()
	year := 2024

	expectedFee := &models.MembershipFee{
		ID:       uuid.New(),
		MemberID: memberID,
		Year:     year,
		Amount:   decimal.NewFromInt(50000),
		Status:   "pending",
	}

	mockRepo.On("GetByMemberAndYear", ctx, memberID, year).Return(expectedFee, nil)

	fee, err := mockRepo.GetByMemberAndYear(ctx, memberID, year)

	assert.NoError(t, err)
	assert.NotNil(t, fee)
	assert.Equal(t, 2024, fee.Year)
	assert.Equal(t, memberID, fee.MemberID)
	mockRepo.AssertExpectations(t)
}

func TestFeeService_DuplicateFee(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(MockFeeRepository)

	memberID := uuid.New()
	year := 2024

	// Return existing fee - simulating duplicate check
	existingFee := &models.MembershipFee{
		ID:       uuid.New(),
		MemberID: memberID,
		Year:     year,
		Amount:   decimal.NewFromInt(50000),
		Status:   "pending",
	}

	mockRepo.On("GetByMemberAndYear", ctx, memberID, year).Return(existingFee, nil)

	// Check if fee exists before creating
	fee, err := mockRepo.GetByMemberAndYear(ctx, memberID, year)

	assert.NoError(t, err)
	assert.NotNil(t, fee)
	// Fee already exists, should not create new one

	mockRepo.AssertExpectations(t)
}
