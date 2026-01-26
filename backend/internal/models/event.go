package models

import (
	"time"

	"github.com/google/uuid"
)

type EventType string

const (
	EventTypeMeeting   EventType = "meeting"
	EventTypeTraining  EventType = "training"
	EventTypeCampaign  EventType = "campaign"
	EventTypeVolunteer EventType = "volunteer"
	EventTypeCultural  EventType = "cultural"
	EventTypeSports    EventType = "sports"
	EventTypeOther     EventType = "other"
)

type EventStatus string

const (
	EventStatusDraft     EventStatus = "draft"
	EventStatusPlanned   EventStatus = "planned"
	EventStatusOngoing   EventStatus = "ongoing"
	EventStatusCompleted EventStatus = "completed"
	EventStatusCancelled EventStatus = "cancelled"
)

type Event struct {
	ID                   uuid.UUID   `json:"id" db:"id"`
	OrganizationID       *uuid.UUID  `json:"organization_id,omitempty" db:"organization_id"`
	Title                string      `json:"title" db:"title" validate:"required,min=2,max=255"`
	Description          *string     `json:"description,omitempty" db:"description"`
	Type                 EventType   `json:"type" db:"type" validate:"required"`
	Status               EventStatus `json:"status" db:"status"`
	StartDate            time.Time   `json:"start_date" db:"start_date" validate:"required"`
	EndDate              *time.Time  `json:"end_date,omitempty" db:"end_date"`
	Location             *string     `json:"location,omitempty" db:"location"`
	Address              *string     `json:"address,omitempty" db:"address"`
	IsOnline             bool        `json:"is_online" db:"is_online"`
	OnlineURL            *string     `json:"online_url,omitempty" db:"online_url"`
	MaxParticipants      *int        `json:"max_participants,omitempty" db:"max_participants"`
	RegistrationDeadline *time.Time  `json:"registration_deadline,omitempty" db:"registration_deadline"`
	IsPublic             bool        `json:"is_public" db:"is_public"`
	CoverImageURL        *string     `json:"cover_image_url,omitempty" db:"cover_image_url"`
	OrganizerID          *uuid.UUID  `json:"organizer_id,omitempty" db:"organizer_id"`
	CreatedAt            time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time   `json:"updated_at" db:"updated_at"`

	// Joined
	OrganizationName *string `json:"organization_name,omitempty" db:"organization_name"`
	OrganizerName    *string `json:"organizer_name,omitempty" db:"organizer_name"`

	// Stats
	TotalRegistered int `json:"total_registered,omitempty" db:"total_registered"`
	TotalAttended   int `json:"total_attended,omitempty" db:"total_attended"`
}

type EventParticipant struct {
	ID           uuid.UUID  `json:"id" db:"id"`
	EventID      uuid.UUID  `json:"event_id" db:"event_id"`
	MemberID     uuid.UUID  `json:"member_id" db:"member_id"`
	RegisteredAt time.Time  `json:"registered_at" db:"registered_at"`
	Attended     bool       `json:"attended" db:"attended"`
	AttendedAt   *time.Time `json:"attended_at,omitempty" db:"attended_at"`
	Notes        *string    `json:"notes,omitempty" db:"notes"`

	// Joined
	MemberName  string  `json:"member_name,omitempty" db:"member_name"`
	MemberEmail *string `json:"member_email,omitempty" db:"member_email"`
	MemberPhone *string `json:"member_phone,omitempty" db:"member_phone"`
}

type CreateEventRequest struct {
	Title                string    `json:"title" validate:"required,min=2,max=255"`
	Description          *string   `json:"description,omitempty"`
	Type                 EventType `json:"type" validate:"required,oneof=meeting training campaign volunteer cultural sports other"`
	StartDate            string    `json:"start_date" validate:"required"`
	EndDate              *string   `json:"end_date,omitempty"`
	Location             *string   `json:"location,omitempty"`
	Address              *string   `json:"address,omitempty"`
	IsOnline             bool      `json:"is_online"`
	OnlineURL            *string   `json:"online_url,omitempty"`
	MaxParticipants      *int      `json:"max_participants,omitempty"`
	RegistrationDeadline *string   `json:"registration_deadline,omitempty"`
	IsPublic             bool      `json:"is_public"`
	OrganizationID       *string   `json:"organization_id,omitempty"`
	CoverImageURL        *string   `json:"cover_image_url,omitempty"`
}

type UpdateEventRequest struct {
	Title                *string      `json:"title,omitempty" validate:"omitempty,min=2,max=255"`
	Description          *string      `json:"description,omitempty"`
	Type                 *EventType   `json:"type,omitempty"`
	Status               *EventStatus `json:"status,omitempty"`
	StartDate            *string      `json:"start_date,omitempty"`
	EndDate              *string      `json:"end_date,omitempty"`
	Location             *string      `json:"location,omitempty"`
	Address              *string      `json:"address,omitempty"`
	IsOnline             *bool        `json:"is_online,omitempty"`
	OnlineURL            *string      `json:"online_url,omitempty"`
	MaxParticipants      *int         `json:"max_participants,omitempty"`
	RegistrationDeadline *string      `json:"registration_deadline,omitempty"`
	IsPublic             *bool        `json:"is_public,omitempty"`
	CoverImageURL        *string      `json:"cover_image_url,omitempty"`
}

type EventListParams struct {
	Page           int          `query:"page"`
	Limit          int          `query:"limit"`
	Search         string       `query:"search"`
	Type           *EventType   `query:"type"`
	Status         *EventStatus `query:"status"`
	OrganizationID *string      `query:"organization_id"`
	StartDateFrom  *string      `query:"start_date_from"`
	StartDateTo    *string      `query:"start_date_to"`
	IsPublic       *bool        `query:"is_public"`
}

type MarkAttendanceRequest struct {
	MemberIDs []string `json:"member_ids" validate:"required,min=1"`
	Attended  bool     `json:"attended"`
}
