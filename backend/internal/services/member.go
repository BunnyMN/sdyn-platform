package services

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"

	"github.com/sdyn/backend/internal/models"
	"github.com/sdyn/backend/internal/repository"
)

type MemberService struct {
	repo  *repository.MemberRepository
	redis *redis.Client
}

func NewMemberService(repo *repository.MemberRepository, redis *redis.Client) *MemberService {
	return &MemberService{
		repo:  repo,
		redis: redis,
	}
}

func (s *MemberService) List(ctx context.Context, params *models.MemberListParams) (*models.MemberListResponse, error) {
	return s.repo.List(ctx, params)
}

func (s *MemberService) GetByID(ctx context.Context, id uuid.UUID) (*models.Member, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *MemberService) GetByEmail(ctx context.Context, email string) (*models.Member, error) {
	return s.repo.GetByEmail(ctx, email)
}

func (s *MemberService) Create(ctx context.Context, req *models.CreateMemberRequest) (*models.Member, error) {
	// Validate unique email if provided
	if req.Email != nil {
		existing, _ := s.repo.GetByEmail(ctx, *req.Email)
		if existing != nil {
			return nil, fmt.Errorf("email already exists")
		}
	}

	member := &models.Member{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Gender:    req.Gender,
		Status:    models.MemberStatusPending,
	}

	if req.Email != nil {
		member.Email = req.Email
	}
	if req.Phone != nil {
		member.Phone = req.Phone
	}
	if req.Address != nil {
		member.Address = req.Address
	}
	if req.NationalID != nil {
		member.NationalID = req.NationalID
	}
	if req.Occupation != nil {
		member.Occupation = req.Occupation
	}
	if req.Workplace != nil {
		member.Workplace = req.Workplace
	}
	if req.Notes != nil {
		member.Notes = req.Notes
	}

	// Parse UUIDs
	if req.ProvinceID != nil {
		id, err := uuid.Parse(*req.ProvinceID)
		if err == nil {
			member.ProvinceID = &id
		}
	}
	if req.DistrictID != nil {
		id, err := uuid.Parse(*req.DistrictID)
		if err == nil {
			member.DistrictID = &id
		}
	}
	if req.OrganizationID != nil {
		id, err := uuid.Parse(*req.OrganizationID)
		if err == nil {
			member.OrganizationID = &id
		}
	}
	if req.ReferredBy != nil {
		id, err := uuid.Parse(*req.ReferredBy)
		if err == nil {
			member.ReferredBy = &id
		}
	}

	// Parse education
	if req.Education != nil {
		edu := models.EducationLevel(*req.Education)
		member.Education = &edu
	}

	return s.repo.Create(ctx, member)
}

func (s *MemberService) Update(ctx context.Context, id uuid.UUID, req *models.UpdateMemberRequest) (*models.Member, error) {
	member, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.FirstName != nil {
		member.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		member.LastName = *req.LastName
	}
	if req.Gender != nil {
		member.Gender = req.Gender
	}
	if req.Email != nil {
		member.Email = req.Email
	}
	if req.Phone != nil {
		member.Phone = req.Phone
	}
	if req.Address != nil {
		member.Address = req.Address
	}
	if req.NationalID != nil {
		member.NationalID = req.NationalID
	}
	if req.Occupation != nil {
		member.Occupation = req.Occupation
	}
	if req.Workplace != nil {
		member.Workplace = req.Workplace
	}
	if req.AvatarURL != nil {
		member.AvatarURL = req.AvatarURL
	}
	if req.Bio != nil {
		member.Bio = req.Bio
	}
	if req.Notes != nil {
		member.Notes = req.Notes
	}

	// Parse UUIDs
	if req.ProvinceID != nil {
		id, err := uuid.Parse(*req.ProvinceID)
		if err == nil {
			member.ProvinceID = &id
		}
	}
	if req.DistrictID != nil {
		id, err := uuid.Parse(*req.DistrictID)
		if err == nil {
			member.DistrictID = &id
		}
	}
	if req.OrganizationID != nil {
		id, err := uuid.Parse(*req.OrganizationID)
		if err == nil {
			member.OrganizationID = &id
		}
	}

	// Parse education
	if req.Education != nil {
		edu := models.EducationLevel(*req.Education)
		member.Education = &edu
	}

	return s.repo.Update(ctx, member)
}

func (s *MemberService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *MemberService) UpdateStatus(ctx context.Context, id uuid.UUID, req *models.UpdateStatusRequest, changedBy string) (*models.Member, error) {
	member, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	oldStatus := member.Status
	member.Status = req.Status

	// Create history record
	changedByUUID, _ := uuid.Parse(changedBy)
	history := &models.MemberHistory{
		MemberID:  id,
		Action:    "status_change",
		OldValue:  stringPtr(string(oldStatus)),
		NewValue:  stringPtr(string(req.Status)),
		ChangedBy: &changedByUUID,
		Reason:    req.Reason,
	}

	if err := s.repo.CreateHistory(ctx, history); err != nil {
		return nil, err
	}

	return s.repo.Update(ctx, member)
}

func (s *MemberService) GetHistory(ctx context.Context, memberID uuid.UUID) ([]models.MemberHistory, error) {
	return s.repo.GetHistory(ctx, memberID)
}

func (s *MemberService) GetReport(ctx context.Context, orgID string) (map[string]interface{}, error) {
	return s.repo.GetReport(ctx, orgID)
}

func stringPtr(s string) *string {
	return &s
}
