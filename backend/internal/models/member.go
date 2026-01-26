package models

import (
	"time"

	"github.com/google/uuid"
)

type MemberStatus string

const (
	MemberStatusPending   MemberStatus = "pending"
	MemberStatusActive    MemberStatus = "active"
	MemberStatusInactive  MemberStatus = "inactive"
	MemberStatusSuspended MemberStatus = "suspended"
	MemberStatusExpelled  MemberStatus = "expelled"
)

type Gender string

const (
	GenderMale   Gender = "male"
	GenderFemale Gender = "female"
	GenderOther  Gender = "other"
)

type EducationLevel string

const (
	EducationPrimary    EducationLevel = "primary"
	EducationSecondary  EducationLevel = "secondary"
	EducationHighSchool EducationLevel = "high_school"
	EducationVocational EducationLevel = "vocational"
	EducationBachelor   EducationLevel = "bachelor"
	EducationMaster     EducationLevel = "master"
	EducationDoctorate  EducationLevel = "doctorate"
)

type Member struct {
	ID             uuid.UUID      `json:"id" db:"id"`
	MemberID       string         `json:"member_id" db:"member_id"`
	KeycloakID     *string        `json:"keycloak_id,omitempty" db:"keycloak_id"`
	OrganizationID *uuid.UUID     `json:"organization_id,omitempty" db:"organization_id"`

	// Personal Info
	FirstName  string     `json:"first_name" db:"first_name" validate:"required,min=2,max=100"`
	LastName   string     `json:"last_name" db:"last_name" validate:"required,min=2,max=100"`
	Gender     *Gender    `json:"gender,omitempty" db:"gender"`
	BirthDate  *time.Time `json:"birth_date,omitempty" db:"birth_date"`
	NationalID *string    `json:"national_id,omitempty" db:"national_id"`

	// Contact
	Email      *string    `json:"email,omitempty" db:"email" validate:"omitempty,email"`
	Phone      *string    `json:"phone,omitempty" db:"phone"`
	Address    *string    `json:"address,omitempty" db:"address"`
	ProvinceID *uuid.UUID `json:"province_id,omitempty" db:"province_id"`
	DistrictID *uuid.UUID `json:"district_id,omitempty" db:"district_id"`

	// Education & Work
	Education  *EducationLevel `json:"education,omitempty" db:"education"`
	Occupation *string         `json:"occupation,omitempty" db:"occupation"`
	Workplace  *string         `json:"workplace,omitempty" db:"workplace"`

	// Membership
	Status              MemberStatus `json:"status" db:"status"`
	JoinedAt            *time.Time   `json:"joined_at,omitempty" db:"joined_at"`
	MembershipExpiresAt *time.Time   `json:"membership_expires_at,omitempty" db:"membership_expires_at"`

	// Profile
	AvatarURL *string `json:"avatar_url,omitempty" db:"avatar_url"`
	Bio       *string `json:"bio,omitempty" db:"bio"`

	// Metadata
	ReferredBy *uuid.UUID `json:"referred_by,omitempty" db:"referred_by"`
	Notes      *string    `json:"notes,omitempty" db:"notes"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at" db:"updated_at"`

	// Joined fields (from views/queries)
	ProvinceName     *string `json:"province_name,omitempty" db:"province_name"`
	DistrictName     *string `json:"district_name,omitempty" db:"district_name"`
	OrganizationName *string `json:"organization_name,omitempty" db:"organization_name"`
}

type MemberHistory struct {
	ID        uuid.UUID  `json:"id" db:"id"`
	MemberID  uuid.UUID  `json:"member_id" db:"member_id"`
	Action    string     `json:"action" db:"action"`
	OldValue  *string    `json:"old_value,omitempty" db:"old_value"`
	NewValue  *string    `json:"new_value,omitempty" db:"new_value"`
	ChangedBy *uuid.UUID `json:"changed_by,omitempty" db:"changed_by"`
	Reason    *string    `json:"reason,omitempty" db:"reason"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
}

type CreateMemberRequest struct {
	FirstName      string     `json:"first_name" validate:"required,min=2,max=100"`
	LastName       string     `json:"last_name" validate:"required,min=2,max=100"`
	Gender         *Gender    `json:"gender,omitempty"`
	BirthDate      *string    `json:"birth_date,omitempty"`
	NationalID     *string    `json:"national_id,omitempty"`
	Email          *string    `json:"email,omitempty" validate:"omitempty,email"`
	Phone          *string    `json:"phone,omitempty"`
	Address        *string    `json:"address,omitempty"`
	ProvinceID     *string    `json:"province_id,omitempty"`
	DistrictID     *string    `json:"district_id,omitempty"`
	OrganizationID *string    `json:"organization_id,omitempty"`
	Education      *string    `json:"education,omitempty"`
	Occupation     *string    `json:"occupation,omitempty"`
	Workplace      *string    `json:"workplace,omitempty"`
	ReferredBy     *string    `json:"referred_by,omitempty"`
	Notes          *string    `json:"notes,omitempty"`
}

type UpdateMemberRequest struct {
	FirstName      *string `json:"first_name,omitempty" validate:"omitempty,min=2,max=100"`
	LastName       *string `json:"last_name,omitempty" validate:"omitempty,min=2,max=100"`
	Gender         *Gender `json:"gender,omitempty"`
	BirthDate      *string `json:"birth_date,omitempty"`
	NationalID     *string `json:"national_id,omitempty"`
	Email          *string `json:"email,omitempty" validate:"omitempty,email"`
	Phone          *string `json:"phone,omitempty"`
	Address        *string `json:"address,omitempty"`
	ProvinceID     *string `json:"province_id,omitempty"`
	DistrictID     *string `json:"district_id,omitempty"`
	OrganizationID *string `json:"organization_id,omitempty"`
	Education      *string `json:"education,omitempty"`
	Occupation     *string `json:"occupation,omitempty"`
	Workplace      *string `json:"workplace,omitempty"`
	AvatarURL      *string `json:"avatar_url,omitempty"`
	Bio            *string `json:"bio,omitempty"`
	Notes          *string `json:"notes,omitempty"`
}

type UpdateStatusRequest struct {
	Status MemberStatus `json:"status" validate:"required,oneof=pending active inactive suspended expelled"`
	Reason *string      `json:"reason,omitempty"`
}

type MemberListParams struct {
	Page           int           `query:"page"`
	Limit          int           `query:"limit"`
	Search         string        `query:"search"`
	Status         *MemberStatus `query:"status"`
	OrganizationID *string       `query:"organization_id"`
	ProvinceID     *string       `query:"province_id"`
	DistrictID     *string       `query:"district_id"`
	SortBy         string        `query:"sort_by"`
	SortOrder      string        `query:"sort_order"`
}

type MemberListResponse struct {
	Members    []Member `json:"members"`
	Total      int      `json:"total"`
	Page       int      `json:"page"`
	Limit      int      `json:"limit"`
	TotalPages int      `json:"total_pages"`
}
