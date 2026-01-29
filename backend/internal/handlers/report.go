package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ReportHandler struct {
	db *pgxpool.Pool
}

func NewReportHandler(db *pgxpool.Pool) *ReportHandler {
	return &ReportHandler{db: db}
}

type DashboardStats struct {
	TotalMembers       int              `json:"total_members"`
	ActiveMembers      int              `json:"active_members"`
	PendingMembers     int              `json:"pending_members"`
	TotalOrganizations int              `json:"total_organizations"`
	TotalEvents        int              `json:"total_events"`
	UpcomingEvents     int              `json:"upcoming_events"`
	FeeCollectionRate  float64          `json:"fee_collection_rate"`
	TotalFeesCollected float64          `json:"total_fees_collected"`
	MembersByProvince  []ProvinceStats  `json:"members_by_province"`
	RecentActivities   []RecentActivity `json:"recent_activities"`
	MemberGrowth       []GrowthStats    `json:"member_growth"`
}

type ProvinceStats struct {
	Province      string `json:"province"`
	ProvinceID    string `json:"province_id"`
	TotalMembers  int    `json:"total_members"`
	ActiveMembers int    `json:"active_members"`
}

type RecentActivity struct {
	Type        string `json:"type"`
	Description string `json:"description"`
	Timestamp   string `json:"timestamp"`
	ActorName   string `json:"actor_name,omitempty"`
}

type GrowthStats struct {
	Month        string `json:"month"`
	NewMembers   int    `json:"new_members"`
	TotalMembers int    `json:"total_members"`
}

// DashboardReport returns dashboard statistics
func (h *ReportHandler) DashboardReport(c *fiber.Ctx) error {
	ctx := c.Context()

	stats := DashboardStats{
		MembersByProvince: []ProvinceStats{},
		RecentActivities:  []RecentActivity{},
		MemberGrowth:      []GrowthStats{},
	}

	// Get member counts by status
	memberQuery := `
		SELECT
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE status = 'active') as active,
			COUNT(*) FILTER (WHERE status = 'pending') as pending
		FROM members
	`
	h.db.QueryRow(ctx, memberQuery).Scan(&stats.TotalMembers, &stats.ActiveMembers, &stats.PendingMembers)

	// Get organization count
	h.db.QueryRow(ctx, "SELECT COUNT(*) FROM organizations WHERE is_active = true").Scan(&stats.TotalOrganizations)

	// Get event counts
	eventQuery := `
		SELECT
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE start_date > NOW() AND status != 'cancelled') as upcoming
		FROM events
	`
	h.db.QueryRow(ctx, eventQuery).Scan(&stats.TotalEvents, &stats.UpcomingEvents)

	// Calculate fee collection rate
	currentYear := time.Now().Year()
	feeQuery := `
		SELECT
			COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) as collected,
			COALESCE(SUM(amount), 0) as total
		FROM membership_fees
		WHERE year = $1
	`
	var collected, totalFees float64
	h.db.QueryRow(ctx, feeQuery, currentYear).Scan(&collected, &totalFees)
	stats.TotalFeesCollected = collected
	if totalFees > 0 {
		stats.FeeCollectionRate = (collected / totalFees) * 100
	}

	// Get members by province
	provinceQuery := `
		SELECT p.id, p.name,
			   COUNT(m.id) as total,
			   COUNT(m.id) FILTER (WHERE m.status = 'active') as active
		FROM provinces p
		LEFT JOIN members m ON m.province_id = p.id
		GROUP BY p.id, p.name
		ORDER BY total DESC
		LIMIT 10
	`
	rows, err := h.db.Query(ctx, provinceQuery)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var ps ProvinceStats
			if rows.Scan(&ps.ProvinceID, &ps.Province, &ps.TotalMembers, &ps.ActiveMembers) == nil {
				stats.MembersByProvince = append(stats.MembersByProvince, ps)
			}
		}
	}

	// Get recent activities (member history)
	activityQuery := `
		SELECT mh.action,
			   COALESCE(mh.new_value, mh.old_value, mh.action) as description,
			   mh.created_at,
			   COALESCE(m.first_name || ' ' || m.last_name, 'System') as actor
		FROM member_history mh
		LEFT JOIN members m ON mh.member_id = m.id
		ORDER BY mh.created_at DESC
		LIMIT 10
	`
	actRows, err := h.db.Query(ctx, activityQuery)
	if err == nil {
		defer actRows.Close()
		for actRows.Next() {
			var ra RecentActivity
			var ts time.Time
			if actRows.Scan(&ra.Type, &ra.Description, &ts, &ra.ActorName) == nil {
				ra.Timestamp = ts.Format(time.RFC3339)
				stats.RecentActivities = append(stats.RecentActivities, ra)
			}
		}
	}

	// Get member growth (last 12 months)
	growthQuery := `
		WITH months AS (
			SELECT generate_series(
				date_trunc('month', NOW() - interval '11 months'),
				date_trunc('month', NOW()),
				interval '1 month'
			) as month
		)
		SELECT
			to_char(m.month, 'YYYY-MM') as month,
			COALESCE(COUNT(mem.id) FILTER (WHERE date_trunc('month', mem.created_at) = m.month), 0) as new_members,
			COALESCE(COUNT(mem.id) FILTER (WHERE mem.created_at <= (m.month + interval '1 month' - interval '1 day')), 0) as total_members
		FROM months m
		LEFT JOIN members mem ON mem.created_at <= (m.month + interval '1 month' - interval '1 day')
		GROUP BY m.month
		ORDER BY m.month
	`
	growthRows, err := h.db.Query(ctx, growthQuery)
	if err == nil {
		defer growthRows.Close()
		for growthRows.Next() {
			var gs GrowthStats
			if growthRows.Scan(&gs.Month, &gs.NewMembers, &gs.TotalMembers) == nil {
				stats.MemberGrowth = append(stats.MemberGrowth, gs)
			}
		}
	}

	return c.JSON(stats)
}

// Legacy function for backward compatibility
func DashboardReport(c *fiber.Ctx) error {
	stats := DashboardStats{
		TotalMembers:       0,
		ActiveMembers:      0,
		PendingMembers:     0,
		TotalOrganizations: 0,
		TotalEvents:        0,
		UpcomingEvents:     0,
		FeeCollectionRate:  0.0,
		TotalFeesCollected: 0.0,
		MembersByProvince:  []ProvinceStats{},
		RecentActivities:   []RecentActivity{},
		MemberGrowth:       []GrowthStats{},
	}

	return c.JSON(stats)
}

// ExportReport handles export requests for various report types
func ExportReport(c *fiber.Ctx) error {
	reportType := c.Params("type")

	// Validate report type
	validTypes := map[string]bool{
		"members":       true,
		"fees":          true,
		"events":        true,
		"organizations": true,
	}

	if !validTypes[reportType] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "Invalid report type. Valid types: members, fees, events, organizations",
		})
	}

	// For now, return a placeholder response
	// In production, this would generate CSV/Excel files
	return c.JSON(fiber.Map{
		"message": "Export request received",
		"type":    reportType,
		"format":  c.Query("format", "csv"),
		"status":  "processing",
		"note":    "Export functionality will be implemented with file generation",
	})
}
