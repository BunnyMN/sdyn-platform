package models

import (
	"time"

	"github.com/google/uuid"
)

type PaymentStatus string

const (
	PaymentStatusPending PaymentStatus = "pending"
	PaymentStatusPaid    PaymentStatus = "paid"
	PaymentStatusOverdue PaymentStatus = "overdue"
	PaymentStatusWaived  PaymentStatus = "waived"
)

type MembershipFee struct {
	ID            uuid.UUID     `json:"id" db:"id"`
	MemberID      uuid.UUID     `json:"member_id" db:"member_id"`
	Year          int           `json:"year" db:"year" validate:"required,min=2020,max=2100"`
	Month         *int          `json:"month,omitempty" db:"month" validate:"omitempty,min=1,max=12"`
	Amount        float64       `json:"amount" db:"amount" validate:"required,min=0"`
	Status        PaymentStatus `json:"status" db:"status"`
	PaidAt        *time.Time    `json:"paid_at,omitempty" db:"paid_at"`
	PaymentMethod *string       `json:"payment_method,omitempty" db:"payment_method"`
	ReceiptNumber *string       `json:"receipt_number,omitempty" db:"receipt_number"`
	Notes         *string       `json:"notes,omitempty" db:"notes"`
	CreatedAt     time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time     `json:"updated_at" db:"updated_at"`

	// Joined
	MemberName   string  `json:"member_name,omitempty" db:"member_name"`
	MemberMID    string  `json:"member_mid,omitempty" db:"member_mid"`
	MemberEmail  *string `json:"member_email,omitempty" db:"member_email"`
	MemberPhone  *string `json:"member_phone,omitempty" db:"member_phone"`
	Organization *string `json:"organization,omitempty" db:"organization"`
}

type CreateFeeRequest struct {
	MemberID      string   `json:"member_id" validate:"required,uuid"`
	Year          int      `json:"year" validate:"required,min=2020,max=2100"`
	Month         *int     `json:"month,omitempty" validate:"omitempty,min=1,max=12"`
	Amount        float64  `json:"amount" validate:"required,min=0"`
	Status        *string  `json:"status,omitempty"`
	PaymentMethod *string  `json:"payment_method,omitempty"`
	ReceiptNumber *string  `json:"receipt_number,omitempty"`
	Notes         *string  `json:"notes,omitempty"`
}

type UpdateFeeRequest struct {
	Amount        *float64 `json:"amount,omitempty" validate:"omitempty,min=0"`
	Status        *string  `json:"status,omitempty" validate:"omitempty,oneof=pending paid overdue waived"`
	PaymentMethod *string  `json:"payment_method,omitempty"`
	ReceiptNumber *string  `json:"receipt_number,omitempty"`
	Notes         *string  `json:"notes,omitempty"`
}

type FeeListParams struct {
	Page           int            `query:"page"`
	Limit          int            `query:"limit"`
	MemberID       *string        `query:"member_id"`
	Year           *int           `query:"year"`
	Month          *int           `query:"month"`
	Status         *PaymentStatus `query:"status"`
	OrganizationID *string        `query:"organization_id"`
}

type BulkCreateFeeRequest struct {
	MemberIDs []string `json:"member_ids" validate:"required,min=1"`
	Year      int      `json:"year" validate:"required,min=2020,max=2100"`
	Month     *int     `json:"month,omitempty" validate:"omitempty,min=1,max=12"`
	Amount    float64  `json:"amount" validate:"required,min=0"`
}

type FeeReport struct {
	TotalAmount    float64                `json:"total_amount"`
	PaidAmount     float64                `json:"paid_amount"`
	PendingAmount  float64                `json:"pending_amount"`
	OverdueAmount  float64                `json:"overdue_amount"`
	WaivedAmount   float64                `json:"waived_amount"`
	TotalCount     int                    `json:"total_count"`
	PaidCount      int                    `json:"paid_count"`
	PendingCount   int                    `json:"pending_count"`
	OverdueCount   int                    `json:"overdue_count"`
	WaivedCount    int                    `json:"waived_count"`
	ByMonth        []MonthlyFeeStats      `json:"by_month,omitempty"`
	ByOrganization []OrganizationFeeStats `json:"by_organization,omitempty"`
}

type MonthlyFeeStats struct {
	Year          int     `json:"year"`
	Month         int     `json:"month"`
	TotalAmount   float64 `json:"total_amount"`
	PaidAmount    float64 `json:"paid_amount"`
	PendingAmount float64 `json:"pending_amount"`
	Count         int     `json:"count"`
}

type OrganizationFeeStats struct {
	OrganizationID   string  `json:"organization_id"`
	OrganizationName string  `json:"organization_name"`
	TotalAmount      float64 `json:"total_amount"`
	PaidAmount       float64 `json:"paid_amount"`
	CollectionRate   float64 `json:"collection_rate"`
}
