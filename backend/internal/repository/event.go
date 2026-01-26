package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/sdyn/backend/internal/models"
)

type EventRepository struct {
	db *pgxpool.Pool
}

func NewEventRepository(db *pgxpool.Pool) *EventRepository {
	return &EventRepository{db: db}
}

func (r *EventRepository) List(ctx context.Context, params *models.EventListParams) ([]models.Event, error) {
	query := `
		SELECT e.*, o.name as organization_name,
			   (m.first_name || ' ' || m.last_name) as organizer_name,
			   (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id) as total_registered,
			   (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id AND ep.attended = true) as total_attended
		FROM events e
		LEFT JOIN organizations o ON e.organization_id = o.id
		LEFT JOIN members m ON e.organizer_id = m.id
		ORDER BY e.start_date DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	events := []models.Event{}
	for rows.Next() {
		var e models.Event
		err := rows.Scan(
			&e.ID, &e.OrganizationID, &e.Title, &e.Description, &e.Type, &e.Status,
			&e.StartDate, &e.EndDate, &e.Location, &e.Address, &e.IsOnline, &e.OnlineURL,
			&e.MaxParticipants, &e.RegistrationDeadline, &e.IsPublic, &e.CoverImageURL,
			&e.OrganizerID, &e.CreatedAt, &e.UpdatedAt,
			&e.OrganizationName, &e.OrganizerName, &e.TotalRegistered, &e.TotalAttended,
		)
		if err != nil {
			return nil, err
		}
		events = append(events, e)
	}

	return events, nil
}

func (r *EventRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Event, error) {
	query := `
		SELECT e.*, o.name as organization_name,
			   (m.first_name || ' ' || m.last_name) as organizer_name,
			   (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id) as total_registered,
			   (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id AND ep.attended = true) as total_attended
		FROM events e
		LEFT JOIN organizations o ON e.organization_id = o.id
		LEFT JOIN members m ON e.organizer_id = m.id
		WHERE e.id = $1
	`

	var e models.Event
	err := r.db.QueryRow(ctx, query, id).Scan(
		&e.ID, &e.OrganizationID, &e.Title, &e.Description, &e.Type, &e.Status,
		&e.StartDate, &e.EndDate, &e.Location, &e.Address, &e.IsOnline, &e.OnlineURL,
		&e.MaxParticipants, &e.RegistrationDeadline, &e.IsPublic, &e.CoverImageURL,
		&e.OrganizerID, &e.CreatedAt, &e.UpdatedAt,
		&e.OrganizationName, &e.OrganizerName, &e.TotalRegistered, &e.TotalAttended,
	)
	if err != nil {
		return nil, err
	}

	return &e, nil
}

func (r *EventRepository) Create(ctx context.Context, event *models.Event) (*models.Event, error) {
	query := `
		INSERT INTO events (
			organization_id, title, description, type, status, start_date, end_date,
			location, address, is_online, online_url, max_participants,
			registration_deadline, is_public, cover_image_url, organizer_id
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(ctx, query,
		event.OrganizationID, event.Title, event.Description, event.Type, event.Status,
		event.StartDate, event.EndDate, event.Location, event.Address, event.IsOnline,
		event.OnlineURL, event.MaxParticipants, event.RegistrationDeadline, event.IsPublic,
		event.CoverImageURL, event.OrganizerID,
	).Scan(&event.ID, &event.CreatedAt, &event.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return event, nil
}

func (r *EventRepository) Update(ctx context.Context, event *models.Event) (*models.Event, error) {
	query := `
		UPDATE events SET
			title = $2, description = $3, type = $4, status = $5,
			start_date = $6, end_date = $7, location = $8, address = $9,
			is_online = $10, online_url = $11, max_participants = $12,
			registration_deadline = $13, is_public = $14, cover_image_url = $15
		WHERE id = $1
		RETURNING updated_at
	`

	err := r.db.QueryRow(ctx, query,
		event.ID, event.Title, event.Description, event.Type, event.Status,
		event.StartDate, event.EndDate, event.Location, event.Address, event.IsOnline,
		event.OnlineURL, event.MaxParticipants, event.RegistrationDeadline, event.IsPublic,
		event.CoverImageURL,
	).Scan(&event.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return event, nil
}

func (r *EventRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, "DELETE FROM events WHERE id = $1", id)
	return err
}

func (r *EventRepository) CountParticipants(ctx context.Context, eventID uuid.UUID) (int, error) {
	var count int
	err := r.db.QueryRow(ctx, "SELECT COUNT(*) FROM event_participants WHERE event_id = $1", eventID).Scan(&count)
	return count, err
}

func (r *EventRepository) RegisterParticipant(ctx context.Context, eventID, memberID uuid.UUID) error {
	query := `
		INSERT INTO event_participants (event_id, member_id)
		VALUES ($1, $2)
		ON CONFLICT (event_id, member_id) DO NOTHING
	`
	_, err := r.db.Exec(ctx, query, eventID, memberID)
	return err
}

func (r *EventRepository) MarkAttendance(ctx context.Context, eventID, memberID uuid.UUID, attended bool) error {
	now := time.Now()
	query := `
		UPDATE event_participants SET attended = $3, attended_at = $4
		WHERE event_id = $1 AND member_id = $2
	`

	var attendedAt *time.Time
	if attended {
		attendedAt = &now
	}

	_, err := r.db.Exec(ctx, query, eventID, memberID, attended, attendedAt)
	return err
}

func (r *EventRepository) GetParticipants(ctx context.Context, eventID uuid.UUID) ([]models.EventParticipant, error) {
	query := `
		SELECT ep.*, (m.first_name || ' ' || m.last_name) as member_name, m.email as member_email, m.phone as member_phone
		FROM event_participants ep
		JOIN members m ON ep.member_id = m.id
		WHERE ep.event_id = $1
		ORDER BY ep.registered_at
	`

	rows, err := r.db.Query(ctx, query, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	participants := []models.EventParticipant{}
	for rows.Next() {
		var p models.EventParticipant
		err := rows.Scan(
			&p.ID, &p.EventID, &p.MemberID, &p.RegisteredAt, &p.Attended, &p.AttendedAt, &p.Notes,
			&p.MemberName, &p.MemberEmail, &p.MemberPhone,
		)
		if err != nil {
			return nil, err
		}
		participants = append(participants, p)
	}

	return participants, nil
}

func (r *EventRepository) GetMemberEvents(ctx context.Context, memberID uuid.UUID) ([]models.Event, error) {
	query := `
		SELECT e.*, o.name as organization_name
		FROM events e
		JOIN event_participants ep ON e.id = ep.event_id
		LEFT JOIN organizations o ON e.organization_id = o.id
		WHERE ep.member_id = $1
		ORDER BY e.start_date DESC
	`

	rows, err := r.db.Query(ctx, query, memberID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	events := []models.Event{}
	for rows.Next() {
		var e models.Event
		err := rows.Scan(
			&e.ID, &e.OrganizationID, &e.Title, &e.Description, &e.Type, &e.Status,
			&e.StartDate, &e.EndDate, &e.Location, &e.Address, &e.IsOnline, &e.OnlineURL,
			&e.MaxParticipants, &e.RegistrationDeadline, &e.IsPublic, &e.CoverImageURL,
			&e.OrganizerID, &e.CreatedAt, &e.UpdatedAt,
			&e.OrganizationName,
		)
		if err != nil {
			return nil, err
		}
		events = append(events, e)
	}

	return events, nil
}

func (r *EventRepository) GetReport(ctx context.Context, orgID, startDate, endDate string) (map[string]interface{}, error) {
	report := map[string]interface{}{
		"total_events":     0,
		"completed_events": 0,
		"total_attendance": 0,
		"by_type":          map[string]int{},
		"by_status":        map[string]int{},
	}

	return report, nil
}
