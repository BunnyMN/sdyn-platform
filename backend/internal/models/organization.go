package models

import (
	"time"

	"github.com/google/uuid"
)

type OrgLevel string

const (
	OrgLevelNational OrgLevel = "national"
	OrgLevelProvince OrgLevel = "province"
	OrgLevelDistrict OrgLevel = "district"
	OrgLevelBranch   OrgLevel = "branch"
)

type Organization struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	ParentID      *uuid.UUID `json:"parent_id,omitempty" db:"parent_id"`
	ProvinceID    *uuid.UUID `json:"province_id,omitempty" db:"province_id"`
	DistrictID    *uuid.UUID `json:"district_id,omitempty" db:"district_id"`
	Name          string     `json:"name" db:"name" validate:"required,min=2,max=255"`
	Level         OrgLevel   `json:"level" db:"level" validate:"required,oneof=national province district branch"`
	Code          *string    `json:"code,omitempty" db:"code"`
	Description   *string    `json:"description,omitempty" db:"description"`
	Address       *string    `json:"address,omitempty" db:"address"`
	Phone         *string    `json:"phone,omitempty" db:"phone"`
	Email         *string    `json:"email,omitempty" db:"email"`
	EstablishedAt *time.Time `json:"established_at,omitempty" db:"established_at"`
	IsActive      bool       `json:"is_active" db:"is_active"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at" db:"updated_at"`

	// Joined fields
	ParentName   *string `json:"parent_name,omitempty" db:"parent_name"`
	ProvinceName *string `json:"province_name,omitempty" db:"province_name"`
	DistrictName *string `json:"district_name,omitempty" db:"district_name"`

	// Stats
	TotalMembers   int `json:"total_members,omitempty" db:"total_members"`
	ActiveMembers  int `json:"active_members,omitempty" db:"active_members"`
	PendingMembers int `json:"pending_members,omitempty" db:"pending_members"`
}

type Province struct {
	ID        uuid.UUID `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Code      string    `json:"code" db:"code"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type District struct {
	ID         uuid.UUID `json:"id" db:"id"`
	ProvinceID uuid.UUID `json:"province_id" db:"province_id"`
	Name       string    `json:"name" db:"name"`
	Code       string    `json:"code" db:"code"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`

	// Joined
	ProvinceName string `json:"province_name,omitempty" db:"province_name"`
}

type Position struct {
	ID          uuid.UUID `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Level       OrgLevel  `json:"level" db:"level"`
	Description *string   `json:"description,omitempty" db:"description"`
	IsActive    bool      `json:"is_active" db:"is_active"`
	SortOrder   int       `json:"sort_order" db:"sort_order"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type MemberPosition struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	MemberID       uuid.UUID  `json:"member_id" db:"member_id"`
	PositionID     uuid.UUID  `json:"position_id" db:"position_id"`
	OrganizationID uuid.UUID  `json:"organization_id" db:"organization_id"`
	StartedAt      time.Time  `json:"started_at" db:"started_at"`
	EndedAt        *time.Time `json:"ended_at,omitempty" db:"ended_at"`
	IsCurrent      bool       `json:"is_current" db:"is_current"`
	AppointedBy    *uuid.UUID `json:"appointed_by,omitempty" db:"appointed_by"`
	Notes          *string    `json:"notes,omitempty" db:"notes"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at" db:"updated_at"`

	// Joined
	PositionName     string `json:"position_name,omitempty" db:"position_name"`
	OrganizationName string `json:"organization_name,omitempty" db:"organization_name"`
	MemberName       string `json:"member_name,omitempty" db:"member_name"`
}

type CreateOrganizationRequest struct {
	Name          string   `json:"name" validate:"required,min=2,max=255"`
	Level         OrgLevel `json:"level" validate:"required,oneof=national province district branch"`
	ParentID      *string  `json:"parent_id,omitempty"`
	ProvinceID    *string  `json:"province_id,omitempty"`
	DistrictID    *string  `json:"district_id,omitempty"`
	Code          *string  `json:"code,omitempty"`
	Description   *string  `json:"description,omitempty"`
	Address       *string  `json:"address,omitempty"`
	Phone         *string  `json:"phone,omitempty"`
	Email         *string  `json:"email,omitempty"`
	EstablishedAt *string  `json:"established_at,omitempty"`
}

type UpdateOrganizationRequest struct {
	Name        *string  `json:"name,omitempty" validate:"omitempty,min=2,max=255"`
	Description *string  `json:"description,omitempty"`
	Address     *string  `json:"address,omitempty"`
	Phone       *string  `json:"phone,omitempty"`
	Email       *string  `json:"email,omitempty"`
	IsActive    *bool    `json:"is_active,omitempty"`
	ParentID    *string  `json:"parent_id,omitempty"`
	ProvinceID  *string  `json:"province_id,omitempty"`
	DistrictID  *string  `json:"district_id,omitempty"`
}

type OrganizationListParams struct {
	Page       int       `query:"page"`
	Limit      int       `query:"limit"`
	Search     string    `query:"search"`
	Level      *OrgLevel `query:"level"`
	ProvinceID *string   `query:"province_id"`
	ParentID   *string   `query:"parent_id"`
	IsActive   *bool     `query:"is_active"`
}

type OrganizationStats struct {
	TotalMembers   int            `json:"total_members"`
	ActiveMembers  int            `json:"active_members"`
	PendingMembers int            `json:"pending_members"`
	TotalFees      float64        `json:"total_fees"`
	PaidFees       float64        `json:"paid_fees"`
	TotalEvents    int            `json:"total_events"`
	ByStatus       map[string]int `json:"by_status"`
	ByGender       map[string]int `json:"by_gender"`
	ByEducation    map[string]int `json:"by_education"`
}
