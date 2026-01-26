package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/sdyn/backend/internal/models"
)

type FeeRepository struct {
	db *pgxpool.Pool
}

func NewFeeRepository(db *pgxpool.Pool) *FeeRepository {
	return &FeeRepository{db: db}
}

func (r *FeeRepository) List(ctx context.Context, params *models.FeeListParams) ([]models.MembershipFee, error) {
	query := `
		SELECT f.*, (m.first_name || ' ' || m.last_name) as member_name, m.member_id as member_mid,
			   m.email as member_email, m.phone as member_phone, o.name as organization
		FROM membership_fees f
		JOIN members m ON f.member_id = m.id
		LEFT JOIN organizations o ON m.organization_id = o.id
		ORDER BY f.year DESC, f.month DESC, f.created_at DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	fees := []models.MembershipFee{}
	for rows.Next() {
		var f models.MembershipFee
		err := rows.Scan(
			&f.ID, &f.MemberID, &f.Year, &f.Month, &f.Amount, &f.Status,
			&f.PaidAt, &f.PaymentMethod, &f.ReceiptNumber, &f.Notes,
			&f.CreatedAt, &f.UpdatedAt,
			&f.MemberName, &f.MemberMID, &f.MemberEmail, &f.MemberPhone, &f.Organization,
		)
		if err != nil {
			return nil, err
		}
		fees = append(fees, f)
	}

	return fees, nil
}

func (r *FeeRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.MembershipFee, error) {
	query := `
		SELECT f.*, (m.first_name || ' ' || m.last_name) as member_name, m.member_id as member_mid,
			   m.email as member_email, m.phone as member_phone, o.name as organization
		FROM membership_fees f
		JOIN members m ON f.member_id = m.id
		LEFT JOIN organizations o ON m.organization_id = o.id
		WHERE f.id = $1
	`

	var f models.MembershipFee
	err := r.db.QueryRow(ctx, query, id).Scan(
		&f.ID, &f.MemberID, &f.Year, &f.Month, &f.Amount, &f.Status,
		&f.PaidAt, &f.PaymentMethod, &f.ReceiptNumber, &f.Notes,
		&f.CreatedAt, &f.UpdatedAt,
		&f.MemberName, &f.MemberMID, &f.MemberEmail, &f.MemberPhone, &f.Organization,
	)
	if err != nil {
		return nil, err
	}

	return &f, nil
}

func (r *FeeRepository) Create(ctx context.Context, fee *models.MembershipFee) (*models.MembershipFee, error) {
	query := `
		INSERT INTO membership_fees (member_id, year, month, amount, status, payment_method, receipt_number, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(ctx, query,
		fee.MemberID, fee.Year, fee.Month, fee.Amount, fee.Status,
		fee.PaymentMethod, fee.ReceiptNumber, fee.Notes,
	).Scan(&fee.ID, &fee.CreatedAt, &fee.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return fee, nil
}

func (r *FeeRepository) Update(ctx context.Context, fee *models.MembershipFee) (*models.MembershipFee, error) {
	query := `
		UPDATE membership_fees SET
			amount = $2, status = $3, paid_at = $4,
			payment_method = $5, receipt_number = $6, notes = $7
		WHERE id = $1
		RETURNING updated_at
	`

	err := r.db.QueryRow(ctx, query,
		fee.ID, fee.Amount, fee.Status, fee.PaidAt,
		fee.PaymentMethod, fee.ReceiptNumber, fee.Notes,
	).Scan(&fee.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return fee, nil
}

func (r *FeeRepository) GetByMember(ctx context.Context, memberID uuid.UUID) ([]models.MembershipFee, error) {
	query := `
		SELECT id, member_id, year, month, amount, status, paid_at, payment_method, receipt_number, notes, created_at, updated_at
		FROM membership_fees
		WHERE member_id = $1
		ORDER BY year DESC, month DESC
	`

	rows, err := r.db.Query(ctx, query, memberID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	fees := []models.MembershipFee{}
	for rows.Next() {
		var f models.MembershipFee
		err := rows.Scan(
			&f.ID, &f.MemberID, &f.Year, &f.Month, &f.Amount, &f.Status,
			&f.PaidAt, &f.PaymentMethod, &f.ReceiptNumber, &f.Notes,
			&f.CreatedAt, &f.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		fees = append(fees, f)
	}

	return fees, nil
}

func (r *FeeRepository) GetReport(ctx context.Context, orgID string, year int) (*models.FeeReport, error) {
	report := &models.FeeReport{
		ByMonth:        []models.MonthlyFeeStats{},
		ByOrganization: []models.OrganizationFeeStats{},
	}

	// Get totals
	totalsQuery := `
		SELECT
			COALESCE(SUM(amount), 0) as total_amount,
			COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_amount,
			COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
			COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as overdue_amount,
			COALESCE(SUM(CASE WHEN status = 'waived' THEN amount ELSE 0 END), 0) as waived_amount,
			COUNT(*) as total_count,
			COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
			COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
			COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
			COUNT(CASE WHEN status = 'waived' THEN 1 END) as waived_count
		FROM membership_fees
		WHERE ($1 = 0 OR year = $1)
	`

	err := r.db.QueryRow(ctx, totalsQuery, year).Scan(
		&report.TotalAmount, &report.PaidAmount, &report.PendingAmount,
		&report.OverdueAmount, &report.WaivedAmount,
		&report.TotalCount, &report.PaidCount, &report.PendingCount,
		&report.OverdueCount, &report.WaivedCount,
	)
	if err != nil {
		return nil, err
	}

	return report, nil
}
