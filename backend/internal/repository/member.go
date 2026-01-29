package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/sdyn/backend/internal/models"
)

type MemberRepository struct {
	db *pgxpool.Pool
}

func NewMemberRepository(db *pgxpool.Pool) *MemberRepository {
	return &MemberRepository{db: db}
}

func (r *MemberRepository) List(ctx context.Context, params *models.MemberListParams) (*models.MemberListResponse, error) {
	offset := (params.Page - 1) * params.Limit

	baseQuery := `
		SELECT m.*, p.name as province_name, d.name as district_name, o.name as organization_name
		FROM members m
		LEFT JOIN provinces p ON m.province_id = p.id
		LEFT JOIN districts d ON m.district_id = d.id
		LEFT JOIN organizations o ON m.organization_id = o.id
		WHERE 1=1
	`
	countQuery := "SELECT COUNT(*) FROM members m WHERE 1=1"
	args := []interface{}{}
	argCount := 0

	// Add filters
	if params.Search != "" {
		argCount++
		filter := fmt.Sprintf(" AND (m.first_name ILIKE $%d OR m.last_name ILIKE $%d OR m.email ILIKE $%d OR m.member_id ILIKE $%d)", argCount, argCount, argCount, argCount)
		baseQuery += filter
		countQuery += filter
		args = append(args, "%"+params.Search+"%")
	}

	if params.Status != nil {
		argCount++
		filter := fmt.Sprintf(" AND m.status = $%d", argCount)
		baseQuery += filter
		countQuery += filter
		args = append(args, *params.Status)
	}

	if params.OrganizationID != nil {
		argCount++
		filter := fmt.Sprintf(" AND m.organization_id = $%d", argCount)
		baseQuery += filter
		countQuery += filter
		args = append(args, *params.OrganizationID)
	}

	if params.ProvinceID != nil {
		argCount++
		filter := fmt.Sprintf(" AND m.province_id = $%d", argCount)
		baseQuery += filter
		countQuery += filter
		args = append(args, *params.ProvinceID)
	}

	// Get total count
	var total int
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	// Add sorting and pagination
	sortBy := "m.created_at"
	if params.SortBy != "" {
		sortBy = "m." + params.SortBy
	}
	sortOrder := "DESC"
	if params.SortOrder == "asc" {
		sortOrder = "ASC"
	}

	baseQuery += fmt.Sprintf(" ORDER BY %s %s LIMIT $%d OFFSET $%d", sortBy, sortOrder, argCount+1, argCount+2)
	args = append(args, params.Limit, offset)

	rows, err := r.db.Query(ctx, baseQuery, args...)
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

	totalPages := (total + params.Limit - 1) / params.Limit

	return &models.MemberListResponse{
		Members:    members,
		Total:      total,
		Page:       params.Page,
		Limit:      params.Limit,
		TotalPages: totalPages,
	}, nil
}

func (r *MemberRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Member, error) {
	query := `
		SELECT m.*, p.name as province_name, d.name as district_name, o.name as organization_name
		FROM members m
		LEFT JOIN provinces p ON m.province_id = p.id
		LEFT JOIN districts d ON m.district_id = d.id
		LEFT JOIN organizations o ON m.organization_id = o.id
		WHERE m.id = $1
	`

	var m models.Member
	err := r.db.QueryRow(ctx, query, id).Scan(
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

	return &m, nil
}

func (r *MemberRepository) GetByEmail(ctx context.Context, email string) (*models.Member, error) {
	query := "SELECT * FROM members WHERE email = $1"

	var m models.Member
	err := r.db.QueryRow(ctx, query, email).Scan(
		&m.ID, &m.MemberID, &m.KeycloakID, &m.OrganizationID,
		&m.FirstName, &m.LastName, &m.Gender, &m.BirthDate, &m.NationalID,
		&m.Email, &m.Phone, &m.Address, &m.ProvinceID, &m.DistrictID,
		&m.Education, &m.Occupation, &m.Workplace,
		&m.Status, &m.JoinedAt, &m.MembershipExpiresAt,
		&m.AvatarURL, &m.Bio, &m.ReferredBy, &m.Notes,
		&m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &m, nil
}

func (r *MemberRepository) Create(ctx context.Context, member *models.Member) (*models.Member, error) {
	query := `
		INSERT INTO members (
			first_name, last_name, gender, birth_date, national_id,
			email, phone, address, province_id, district_id, organization_id,
			education, occupation, workplace, status, referred_by, notes
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
		RETURNING id, member_id, created_at, updated_at
	`

	err := r.db.QueryRow(ctx, query,
		member.FirstName, member.LastName, member.Gender, member.BirthDate, member.NationalID,
		member.Email, member.Phone, member.Address, member.ProvinceID, member.DistrictID, member.OrganizationID,
		member.Education, member.Occupation, member.Workplace, member.Status, member.ReferredBy, member.Notes,
	).Scan(&member.ID, &member.MemberID, &member.CreatedAt, &member.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return member, nil
}

func (r *MemberRepository) Update(ctx context.Context, member *models.Member) (*models.Member, error) {
	query := `
		UPDATE members SET
			first_name = $2, last_name = $3, gender = $4, birth_date = $5, national_id = $6,
			email = $7, phone = $8, address = $9, province_id = $10, district_id = $11, organization_id = $12,
			education = $13, occupation = $14, workplace = $15, status = $16,
			avatar_url = $17, bio = $18, notes = $19
		WHERE id = $1
		RETURNING updated_at
	`

	err := r.db.QueryRow(ctx, query,
		member.ID,
		member.FirstName, member.LastName, member.Gender, member.BirthDate, member.NationalID,
		member.Email, member.Phone, member.Address, member.ProvinceID, member.DistrictID, member.OrganizationID,
		member.Education, member.Occupation, member.Workplace, member.Status,
		member.AvatarURL, member.Bio, member.Notes,
	).Scan(&member.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return member, nil
}

func (r *MemberRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, "DELETE FROM members WHERE id = $1", id)
	return err
}

func (r *MemberRepository) CreateHistory(ctx context.Context, history *models.MemberHistory) error {
	query := `
		INSERT INTO member_history (member_id, action, old_value, new_value, changed_by, reason)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.Exec(ctx, query, history.MemberID, history.Action, history.OldValue, history.NewValue, history.ChangedBy, history.Reason)
	return err
}

func (r *MemberRepository) GetHistory(ctx context.Context, memberID uuid.UUID) ([]models.MemberHistory, error) {
	query := `
		SELECT id, member_id, action, old_value, new_value, changed_by, reason, created_at
		FROM member_history
		WHERE member_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, memberID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	history := []models.MemberHistory{}
	for rows.Next() {
		var h models.MemberHistory
		err := rows.Scan(&h.ID, &h.MemberID, &h.Action, &h.OldValue, &h.NewValue, &h.ChangedBy, &h.Reason, &h.CreatedAt)
		if err != nil {
			return nil, err
		}
		history = append(history, h)
	}

	return history, nil
}

func (r *MemberRepository) GetReport(ctx context.Context, orgID string) (map[string]interface{}, error) {
	report := map[string]interface{}{
		"total_members":   0,
		"active_members":  0,
		"pending_members": 0,
		"by_status":       map[string]int{},
		"by_gender":       map[string]int{},
		"by_education":    map[string]int{},
		"by_province":     []map[string]interface{}{},
		"by_age_group":    map[string]int{},
	}

	// Base query with optional org filter
	baseCondition := ""
	args := []interface{}{}
	if orgID != "" {
		baseCondition = "WHERE organization_id = $1"
		args = append(args, orgID)
	}

	// Total counts
	countQuery := fmt.Sprintf(`
		SELECT
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE status = 'active') as active,
			COUNT(*) FILTER (WHERE status = 'pending') as pending
		FROM members %s
	`, baseCondition)
	var total, active, pending int
	r.db.QueryRow(ctx, countQuery, args...).Scan(&total, &active, &pending)
	report["total_members"] = total
	report["active_members"] = active
	report["pending_members"] = pending

	// By status
	statusQuery := fmt.Sprintf(`
		SELECT status, COUNT(*) as count
		FROM members %s
		GROUP BY status
	`, baseCondition)
	statusRows, err := r.db.Query(ctx, statusQuery, args...)
	if err == nil {
		defer statusRows.Close()
		byStatus := map[string]int{}
		for statusRows.Next() {
			var status string
			var count int
			if statusRows.Scan(&status, &count) == nil {
				byStatus[status] = count
			}
		}
		report["by_status"] = byStatus
	}

	// By gender
	genderQuery := fmt.Sprintf(`
		SELECT COALESCE(gender, 'unknown') as gender, COUNT(*) as count
		FROM members %s
		GROUP BY gender
	`, baseCondition)
	genderRows, err := r.db.Query(ctx, genderQuery, args...)
	if err == nil {
		defer genderRows.Close()
		byGender := map[string]int{}
		for genderRows.Next() {
			var gender string
			var count int
			if genderRows.Scan(&gender, &count) == nil {
				byGender[gender] = count
			}
		}
		report["by_gender"] = byGender
	}

	// By education
	educationQuery := fmt.Sprintf(`
		SELECT COALESCE(education, 'unknown') as education, COUNT(*) as count
		FROM members %s
		GROUP BY education
	`, baseCondition)
	educationRows, err := r.db.Query(ctx, educationQuery, args...)
	if err == nil {
		defer educationRows.Close()
		byEducation := map[string]int{}
		for educationRows.Next() {
			var education string
			var count int
			if educationRows.Scan(&education, &count) == nil {
				byEducation[education] = count
			}
		}
		report["by_education"] = byEducation
	}

	// By province
	provinceQuery := fmt.Sprintf(`
		SELECT p.name, COUNT(m.id) as count
		FROM members m
		JOIN provinces p ON m.province_id = p.id
		%s
		GROUP BY p.name
		ORDER BY count DESC
	`, baseCondition)
	provinceRows, err := r.db.Query(ctx, provinceQuery, args...)
	if err == nil {
		defer provinceRows.Close()
		byProvince := []map[string]interface{}{}
		for provinceRows.Next() {
			var province string
			var count int
			if provinceRows.Scan(&province, &count) == nil {
				byProvince = append(byProvince, map[string]interface{}{
					"province": province,
					"count":    count,
				})
			}
		}
		report["by_province"] = byProvince
	}

	// By age group
	ageQuery := fmt.Sprintf(`
		SELECT
			CASE
				WHEN EXTRACT(YEAR FROM AGE(birth_date)) < 18 THEN 'under_18'
				WHEN EXTRACT(YEAR FROM AGE(birth_date)) BETWEEN 18 AND 25 THEN '18_25'
				WHEN EXTRACT(YEAR FROM AGE(birth_date)) BETWEEN 26 AND 35 THEN '26_35'
				WHEN EXTRACT(YEAR FROM AGE(birth_date)) BETWEEN 36 AND 45 THEN '36_45'
				ELSE 'over_45'
			END as age_group,
			COUNT(*) as count
		FROM members
		WHERE birth_date IS NOT NULL %s
		GROUP BY age_group
	`, func() string { if orgID != "" { return "AND organization_id = $1" } else { return "" } }())
	ageRows, err := r.db.Query(ctx, ageQuery, args...)
	if err == nil {
		defer ageRows.Close()
		byAge := map[string]int{}
		for ageRows.Next() {
			var ageGroup string
			var count int
			if ageRows.Scan(&ageGroup, &count) == nil {
				byAge[ageGroup] = count
			}
		}
		report["by_age_group"] = byAge
	}

	return report, nil
}
