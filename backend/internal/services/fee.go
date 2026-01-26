package services

import (
	"context"

	"github.com/google/uuid"

	"github.com/sdyn/backend/internal/models"
	"github.com/sdyn/backend/internal/repository"
)

type FeeService struct {
	repo *repository.FeeRepository
}

func NewFeeService(repo *repository.FeeRepository) *FeeService {
	return &FeeService{repo: repo}
}

func (s *FeeService) List(ctx context.Context, params *models.FeeListParams) ([]models.MembershipFee, error) {
	return s.repo.List(ctx, params)
}

func (s *FeeService) GetByID(ctx context.Context, id uuid.UUID) (*models.MembershipFee, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *FeeService) Create(ctx context.Context, req *models.CreateFeeRequest) (*models.MembershipFee, error) {
	memberID, err := uuid.Parse(req.MemberID)
	if err != nil {
		return nil, err
	}

	fee := &models.MembershipFee{
		MemberID: memberID,
		Year:     req.Year,
		Month:    req.Month,
		Amount:   req.Amount,
		Status:   models.PaymentStatusPending,
	}

	if req.Status != nil {
		fee.Status = models.PaymentStatus(*req.Status)
	}
	if req.PaymentMethod != nil {
		fee.PaymentMethod = req.PaymentMethod
	}
	if req.ReceiptNumber != nil {
		fee.ReceiptNumber = req.ReceiptNumber
	}
	if req.Notes != nil {
		fee.Notes = req.Notes
	}

	return s.repo.Create(ctx, fee)
}

func (s *FeeService) Update(ctx context.Context, id uuid.UUID, req *models.UpdateFeeRequest) (*models.MembershipFee, error) {
	fee, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Amount != nil {
		fee.Amount = *req.Amount
	}
	if req.Status != nil {
		fee.Status = models.PaymentStatus(*req.Status)
	}
	if req.PaymentMethod != nil {
		fee.PaymentMethod = req.PaymentMethod
	}
	if req.ReceiptNumber != nil {
		fee.ReceiptNumber = req.ReceiptNumber
	}
	if req.Notes != nil {
		fee.Notes = req.Notes
	}

	return s.repo.Update(ctx, fee)
}

func (s *FeeService) GetByMember(ctx context.Context, memberID uuid.UUID) ([]models.MembershipFee, error) {
	return s.repo.GetByMember(ctx, memberID)
}

func (s *FeeService) BulkCreate(ctx context.Context, req *models.BulkCreateFeeRequest) (int, error) {
	created := 0
	for _, memberIDStr := range req.MemberIDs {
		memberID, err := uuid.Parse(memberIDStr)
		if err != nil {
			continue
		}

		fee := &models.MembershipFee{
			MemberID: memberID,
			Year:     req.Year,
			Month:    req.Month,
			Amount:   req.Amount,
			Status:   models.PaymentStatusPending,
		}

		_, err = s.repo.Create(ctx, fee)
		if err == nil {
			created++
		}
	}
	return created, nil
}

func (s *FeeService) GetReport(ctx context.Context, orgID string, year int) (*models.FeeReport, error) {
	return s.repo.GetReport(ctx, orgID, year)
}
