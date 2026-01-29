package repository

import (
	"context"
	"fmt"
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
		"total_events":      0,
		"completed_events":  0,
		"cancelled_events":  0,
		"upcoming_events":   0,
		"total_registered":  0,
		"total_attended":    0,
		"attendance_rate":   0.0,
		"by_type":           map[string]int{},
		"by_status":         map[string]int{},
		"by_month":          []map[string]interface{}{},
		"top_events":        []map[string]interface{}{},
	}

	// Build base condition
	conditions := []string{}
	args := []interface{}{}
	argCount := 0

	if orgID != "" {
		argCount++
		conditions = append(conditions, fmt.Sprintf("organization_id = $%d", argCount))
		args = append(args, orgID)
	}
	if startDate != "" {
		argCount++
		conditions = append(conditions, fmt.Sprintf("start_date >= $%d", argCount))
		args = append(args, startDate)
	}
	if endDate != "" {
		argCount++
		conditions = append(conditions, fmt.Sprintf("end_date <= $%d", argCount))
		args = append(args, endDate)
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + conditions[0]
		for i := 1; i < len(conditions); i++ {
			whereClause += " AND " + conditions[i]
		}
	}

	// Total event counts by status
	countQuery := fmt.Sprintf(`
		SELECT
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE status = 'completed') as completed,
			COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
			COUNT(*) FILTER (WHERE status IN ('draft', 'published') AND start_date > NOW()) as upcoming
		FROM events %s
	`, whereClause)
	var total, completed, cancelled, upcoming int
	r.db.QueryRow(ctx, countQuery, args...).Scan(&total, &completed, &cancelled, &upcoming)
	report["total_events"] = total
	report["completed_events"] = completed
	report["cancelled_events"] = cancelled
	report["upcoming_events"] = upcoming

	// Participation stats
	partQuery := fmt.Sprintf(`
		SELECT
			COALESCE(SUM(registered), 0) as total_registered,
			COALESCE(SUM(attended), 0) as total_attended
		FROM (
			SELECT
				COUNT(*) as registered,
				COUNT(*) FILTER (WHERE ep.attended = true) as attended
			FROM events e
			LEFT JOIN event_participants ep ON e.id = ep.event_id
			%s
			GROUP BY e.id
		) sub
	`, whereClause)
	var registered, attended int
	r.db.QueryRow(ctx, partQuery, args...).Scan(&registered, &attended)
	report["total_registered"] = registered
	report["total_attended"] = attended
	if registered > 0 {
		report["attendance_rate"] = float64(attended) / float64(registered) * 100
	}

	// By type
	typeQuery := fmt.Sprintf(`
		SELECT COALESCE(type, 'other') as type, COUNT(*) as count
		FROM events %s
		GROUP BY type
	`, whereClause)
	typeRows, err := r.db.Query(ctx, typeQuery, args...)
	if err == nil {
		defer typeRows.Close()
		byType := map[string]int{}
		for typeRows.Next() {
			var eventType string
			var count int
			if typeRows.Scan(&eventType, &count) == nil {
				byType[eventType] = count
			}
		}
		report["by_type"] = byType
	}

	// By status
	statusQuery := fmt.Sprintf(`
		SELECT status, COUNT(*) as count
		FROM events %s
		GROUP BY status
	`, whereClause)
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

	// By month (last 12 months)
	monthQuery := `
		SELECT
			to_char(date_trunc('month', start_date), 'YYYY-MM') as month,
			COUNT(*) as count,
			COUNT(*) FILTER (WHERE status = 'completed') as completed
		FROM events
		WHERE start_date >= NOW() - interval '12 months'
		GROUP BY date_trunc('month', start_date)
		ORDER BY month
	`
	monthRows, err := r.db.Query(ctx, monthQuery)
	if err == nil {
		defer monthRows.Close()
		byMonth := []map[string]interface{}{}
		for monthRows.Next() {
			var month string
			var count, completedCount int
			if monthRows.Scan(&month, &count, &completedCount) == nil {
				byMonth = append(byMonth, map[string]interface{}{
					"month":     month,
					"total":     count,
					"completed": completedCount,
				})
			}
		}
		report["by_month"] = byMonth
	}

	// Top events by participation
	topQuery := fmt.Sprintf(`
		SELECT
			e.id, e.title, e.type, e.start_date,
			COUNT(ep.id) as registered,
			COUNT(ep.id) FILTER (WHERE ep.attended = true) as attended
		FROM events e
		LEFT JOIN event_participants ep ON e.id = ep.event_id
		%s
		GROUP BY e.id
		ORDER BY registered DESC
		LIMIT 5
	`, whereClause)
	topRows, err := r.db.Query(ctx, topQuery, args...)
	if err == nil {
		defer topRows.Close()
		topEvents := []map[string]interface{}{}
		for topRows.Next() {
			var id, title string
			var eventType *string
			var startDate *time.Time
			var regCount, attCount int
			if topRows.Scan(&id, &title, &eventType, &startDate, &regCount, &attCount) == nil {
				event := map[string]interface{}{
					"id":         id,
					"title":      title,
					"registered": regCount,
					"attended":   attCount,
				}
				if eventType != nil {
					event["type"] = *eventType
				}
				if startDate != nil {
					event["start_date"] = startDate.Format("2006-01-02")
				}
				topEvents = append(topEvents, event)
			}
		}
		report["top_events"] = topEvents
	}

	return report, nil
}
