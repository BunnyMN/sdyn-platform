package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/sdyn/backend/internal/models"
)

type OrganizationRepository struct {
	db *pgxpool.Pool
}

func NewOrganizationRepository(db *pgxpool.Pool) *OrganizationRepository {
	return &OrganizationRepository{db: db}
}

func (r *OrganizationRepository) List(ctx context.Context, params *models.OrganizationListParams) ([]models.Organization, error) {
	query := `
		SELECT o.*, p.name as province_name, d.name as district_name,
			   (SELECT COUNT(*) FROM members m WHERE m.organization_id = o.id) as total_members,
			   (SELECT COUNT(*) FROM members m WHERE m.organization_id = o.id AND m.status = 'active') as active_members
		FROM organizations o
		LEFT JOIN provinces p ON o.province_id = p.id
		LEFT JOIN districts d ON o.district_id = d.id
		WHERE o.is_active = true
		ORDER BY o.level, o.name
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orgs := []models.Organization{}
	for rows.Next() {
		var o models.Organization
		err := rows.Scan(
			&o.ID, &o.ParentID, &o.ProvinceID, &o.DistrictID,
			&o.Name, &o.Level, &o.Code, &o.Description, &o.Address, &o.Phone, &o.Email,
			&o.EstablishedAt, &o.IsActive, &o.CreatedAt, &o.UpdatedAt,
			&o.ProvinceName, &o.DistrictName, &o.TotalMembers, &o.ActiveMembers,
		)
		if err != nil {
			return nil, err
		}
		orgs = append(orgs, o)
	}

	return orgs, nil
}

func (r *OrganizationRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Organization, error) {
	query := `
		SELECT o.*, p.name as province_name, d.name as district_name,
			   (SELECT COUNT(*) FROM members m WHERE m.organization_id = o.id) as total_members,
			   (SELECT COUNT(*) FROM members m WHERE m.organization_id = o.id AND m.status = 'active') as active_members
		FROM organizations o
		LEFT JOIN provinces p ON o.province_id = p.id
		LEFT JOIN districts d ON o.district_id = d.id
		WHERE o.id = $1
	`

	var o models.Organization
	err := r.db.QueryRow(ctx, query, id).Scan(
		&o.ID, &o.ParentID, &o.ProvinceID, &o.DistrictID,
		&o.Name, &o.Level, &o.Code, &o.Description, &o.Address, &o.Phone, &o.Email,
		&o.EstablishedAt, &o.IsActive, &o.CreatedAt, &o.UpdatedAt,
		&o.ProvinceName, &o.DistrictName, &o.TotalMembers, &o.ActiveMembers,
	)
	if err != nil {
		return nil, err
	}

	return &o, nil
}

func (r *OrganizationRepository) Create(ctx context.Context, org *models.Organization) (*models.Organization, error) {
	query := `
		INSERT INTO organizations (parent_id, province_id, district_id, name, level, code, description, address, phone, email, established_at, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(ctx, query,
		org.ParentID, org.ProvinceID, org.DistrictID, org.Name, org.Level, org.Code,
		org.Description, org.Address, org.Phone, org.Email, org.EstablishedAt, org.IsActive,
	).Scan(&org.ID, &org.CreatedAt, &org.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return org, nil
}

func (r *OrganizationRepository) Update(ctx context.Context, org *models.Organization) (*models.Organization, error) {
	query := `
		UPDATE organizations SET
			parent_id = $2, province_id = $3, district_id = $4, name = $5,
			description = $6, address = $7, phone = $8, email = $9, is_active = $10
		WHERE id = $1
		RETURNING updated_at
	`

	err := r.db.QueryRow(ctx, query,
		org.ID, org.ParentID, org.ProvinceID, org.DistrictID, org.Name,
		org.Description, org.Address, org.Phone, org.Email, org.IsActive,
	).Scan(&org.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return org, nil
}

func (r *OrganizationRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, "DELETE FROM organizations WHERE id = $1", id)
	return err
}

func (r *OrganizationRepository) GetMembers(ctx context.Context, orgID uuid.UUID, page, limit int) (*models.MemberListResponse, error) {
	offset := (page - 1) * limit

	countQuery := "SELECT COUNT(*) FROM members WHERE organization_id = $1"
	var total int
	err := r.db.QueryRow(ctx, countQuery, orgID).Scan(&total)
	if err != nil {
		return nil, err
	}

	query := `
		SELECT m.*, p.name as province_name, d.name as district_name, o.name as organization_name
		FROM members m
		LEFT JOIN provinces p ON m.province_id = p.id
		LEFT JOIN districts d ON m.district_id = d.id
		LEFT JOIN organizations o ON m.organization_id = o.id
		WHERE m.organization_id = $1
		ORDER BY m.created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(ctx, query, orgID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	members := []models.Member{}
	for rows.Next() {
		var m models.Member
		err := rows.Scan(
			&m.ID, &m.MemberID, &m.KeycloakID, &m.OrganizationID,
			&m.FirstName, &m.LastName, &m.Gender, &m.BirthDate, &m.NationalID,
			&m.Email, &m.Phone, &m.Address, &m.ProvinceID, &m.DistrictID,
			&m.Education, &m.Occupation, &m.Workplace,
			&m.Status, &m.JoinedAt, &m.MembershipExpiresAt,
			&m.AvatarURL, &m.Bio, &m.ReferredBy, &m.Notes,
			&m.CreatedAt, &m.UpdatedAt,
			&m.ProvinceName, &m.DistrictName, &m.OrganizationName,
		)
		if err != nil {
			return nil, err
		}
		members = append(members, m)
	}

	totalPages := (total + limit - 1) / limit

	return &models.MemberListResponse{
		Members:    members,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (r *OrganizationRepository) GetStats(ctx context.Context, orgID uuid.UUID) (*models.OrganizationStats, error) {
	stats := &models.OrganizationStats{
		ByStatus:    make(map[string]int),
		ByGender:    make(map[string]int),
		ByEducation: make(map[string]int),
	}

	// Get member counts
	query := `
		SELECT
			COUNT(*) as total,
			COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
			COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
		FROM members
		WHERE organization_id = $1
	`
	err := r.db.QueryRow(ctx, query, orgID).Scan(&stats.TotalMembers, &stats.ActiveMembers, &stats.PendingMembers)
	if err != nil {
		return nil, err
	}

	return stats, nil
}

func (r *OrganizationRepository) GetProvinces(ctx context.Context) ([]models.Province, error) {
	query := "SELECT id, name, code, created_at, updated_at FROM provinces ORDER BY name"

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	provinces := []models.Province{}
	for rows.Next() {
		var p models.Province
		err := rows.Scan(&p.ID, &p.Name, &p.Code, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, err
		}
		provinces = append(provinces, p)
	}

	return provinces, nil
}

func (r *OrganizationRepository) GetDistricts(ctx context.Context, provinceID uuid.UUID) ([]models.District, error) {
	query := `
		SELECT d.id, d.province_id, d.name, d.code, d.created_at, d.updated_at, p.name as province_name
		FROM districts d
		JOIN provinces p ON d.province_id = p.id
		WHERE d.province_id = $1
		ORDER BY d.name
	`

	rows, err := r.db.Query(ctx, query, provinceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	districts := []models.District{}
	for rows.Next() {
		var d models.District
		err := rows.Scan(&d.ID, &d.ProvinceID, &d.Name, &d.Code, &d.CreatedAt, &d.UpdatedAt, &d.ProvinceName)
		if err != nil {
			return nil, err
		}
		districts = append(districts, d)
	}

	return districts, nil
}
