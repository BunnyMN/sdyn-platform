package services

import (
	"context"

	"github.com/google/uuid"

	"github.com/sdyn/backend/internal/models"
	"github.com/sdyn/backend/internal/repository"
)

type OrganizationService struct {
	repo *repository.OrganizationRepository
}

func NewOrganizationService(repo *repository.OrganizationRepository) *OrganizationService {
	return &OrganizationService{repo: repo}
}

func (s *OrganizationService) List(ctx context.Context, params *models.OrganizationListParams) ([]models.Organization, error) {
	return s.repo.List(ctx, params)
}

func (s *OrganizationService) GetByID(ctx context.Context, id uuid.UUID) (*models.Organization, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *OrganizationService) Create(ctx context.Context, req *models.CreateOrganizationRequest) (*models.Organization, error) {
	org := &models.Organization{
		Name:     req.Name,
		Level:    req.Level,
		Code:     req.Code,
		IsActive: true,
	}

	if req.Description != nil {
		org.Description = req.Description
	}
	if req.Address != nil {
		org.Address = req.Address
	}
	if req.Phone != nil {
		org.Phone = req.Phone
	}
	if req.Email != nil {
		org.Email = req.Email
	}

	// Parse UUIDs
	if req.ParentID != nil {
		id, err := uuid.Parse(*req.ParentID)
		if err == nil {
			org.ParentID = &id
		}
	}
	if req.ProvinceID != nil {
		id, err := uuid.Parse(*req.ProvinceID)
		if err == nil {
			org.ProvinceID = &id
		}
	}
	if req.DistrictID != nil {
		id, err := uuid.Parse(*req.DistrictID)
		if err == nil {
			org.DistrictID = &id
		}
	}

	return s.repo.Create(ctx, org)
}

func (s *OrganizationService) Update(ctx context.Context, id uuid.UUID, req *models.UpdateOrganizationRequest) (*models.Organization, error) {
	org, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		org.Name = *req.Name
	}
	if req.Description != nil {
		org.Description = req.Description
	}
	if req.Address != nil {
		org.Address = req.Address
	}
	if req.Phone != nil {
		org.Phone = req.Phone
	}
	if req.Email != nil {
		org.Email = req.Email
	}
	if req.IsActive != nil {
		org.IsActive = *req.IsActive
	}

	// Parse UUIDs
	if req.ParentID != nil {
		id, err := uuid.Parse(*req.ParentID)
		if err == nil {
			org.ParentID = &id
		}
	}
	if req.ProvinceID != nil {
		id, err := uuid.Parse(*req.ProvinceID)
		if err == nil {
			org.ProvinceID = &id
		}
	}
	if req.DistrictID != nil {
		id, err := uuid.Parse(*req.DistrictID)
		if err == nil {
			org.DistrictID = &id
		}
	}

	return s.repo.Update(ctx, org)
}

func (s *OrganizationService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *OrganizationService) GetMembers(ctx context.Context, orgID uuid.UUID, page, limit int) (*models.MemberListResponse, error) {
	return s.repo.GetMembers(ctx, orgID, page, limit)
}

func (s *OrganizationService) GetStats(ctx context.Context, orgID uuid.UUID) (*models.OrganizationStats, error) {
	return s.repo.GetStats(ctx, orgID)
}

func (s *OrganizationService) GetProvinces(ctx context.Context) ([]models.Province, error) {
	return s.repo.GetProvinces(ctx)
}

func (s *OrganizationService) GetDistricts(ctx context.Context, provinceID uuid.UUID) ([]models.District, error) {
	return s.repo.GetDistricts(ctx, provinceID)
}
