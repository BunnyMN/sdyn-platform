package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/sdyn/backend/internal/config"
	"github.com/sdyn/backend/internal/handlers"
	"github.com/sdyn/backend/internal/middleware"
	"github.com/sdyn/backend/internal/models"
	"github.com/sdyn/backend/internal/repository"
	"github.com/sdyn/backend/internal/services"
	"github.com/sdyn/backend/pkg/database"
)

func main() {
	// Initialize logger
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	if os.Getenv("APP_ENV") != "production" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	}

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load configuration")
	}

	// Connect to PostgreSQL
	db, err := database.NewPostgres(cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}
	defer db.Close()

	// Connect to Redis
	rdb, err := database.NewRedis(cfg.RedisURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to Redis")
	}
	defer rdb.Close()

	// Initialize repositories
	memberRepo := repository.NewMemberRepository(db)
	orgRepo := repository.NewOrganizationRepository(db)
	eventRepo := repository.NewEventRepository(db)
	feeRepo := repository.NewFeeRepository(db)

	// Initialize services
	memberService := services.NewMemberService(memberRepo, rdb)
	orgService := services.NewOrganizationService(orgRepo)
	eventService := services.NewEventService(eventRepo)
	feeService := services.NewFeeService(feeRepo)
	authService := services.NewAuthService(cfg, db, rdb)
	authzService := services.NewAuthorizationService(db, rdb)

	// Initialize Keycloak validator
	if err := middleware.InitKeycloakValidator(cfg); err != nil {
		log.Warn().Err(err).Msg("Failed to initialize Keycloak validator, falling back to legacy JWT auth")
	} else {
		log.Info().Msg("Keycloak JWT validation enabled")
	}

	// Initialize authorization service for RBAC
	middleware.InitAuthorizationService(authzService)

	// Initialize handlers
	memberHandler := handlers.NewMemberHandler(memberService)
	orgHandler := handlers.NewOrganizationHandler(orgService)
	eventHandler := handlers.NewEventHandler(eventService)
	feeHandler := handlers.NewFeeHandler(feeService)
	authHandler := handlers.NewAuthHandler(authService)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:               "SDYN API v1.0.0",
		ErrorHandler:          handlers.ErrorHandler,
		DisableStartupMessage: cfg.Env == "production",
		ReadTimeout:           10 * time.Second,
		WriteTimeout:          10 * time.Second,
	})

	// Global middleware
	app.Use(recover.New())
	app.Use(helmet.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))

	// CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.AllowedOrigins,
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowCredentials: true,
	}))

	// Rate limiting
	app.Use(limiter.New(limiter.Config{
		Max:               100,
		Expiration:        1 * time.Minute,
		LimiterMiddleware: limiter.SlidingWindow{},
	}))

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "healthy",
			"time":    time.Now().Format(time.RFC3339),
			"version": "1.0.0",
		})
	})

	// API routes
	api := app.Group("/api/v1")

	// Auth routes (public)
	auth := api.Group("/auth")
	auth.Post("/login", authHandler.Login)
	auth.Post("/register", authHandler.Register)
	auth.Post("/refresh", authHandler.RefreshToken)
	auth.Post("/logout", authHandler.Logout)

	// Protected routes - use Keycloak JWT validation with token blacklist check and audit logging
	protected := api.Group("",
		middleware.KeycloakJWTAuth(),
		middleware.CheckTokenBlacklist(),
		middleware.DataScope(),
		middleware.AuditLogger(authzService),
	)

	// Members - with RBAC permission checking
	members := protected.Group("/members")
	members.Get("/", middleware.RequirePermission(models.ResourceMember, models.ActionList), memberHandler.List)
	members.Get("/:id", middleware.RBACWithResourceCheck(models.ResourceMember, models.ActionRead), memberHandler.Get)
	members.Post("/", middleware.RequirePermission(models.ResourceMember, models.ActionCreate), memberHandler.Create)
	members.Put("/:id", middleware.RBACWithResourceCheck(models.ResourceMember, models.ActionUpdate), memberHandler.Update)
	members.Delete("/:id", middleware.RBACWithResourceCheck(models.ResourceMember, models.ActionDelete), memberHandler.Delete)
	members.Get("/:id/history", middleware.RBACWithResourceCheck(models.ResourceMember, models.ActionRead), memberHandler.GetHistory)
	members.Post("/:id/status", middleware.RBACWithResourceCheck(models.ResourceMember, models.ActionApprove), memberHandler.UpdateStatus)

	// Organizations - with RBAC permission checking
	orgs := protected.Group("/organizations")
	orgs.Get("/", middleware.RequirePermission(models.ResourceOrganization, models.ActionList), orgHandler.List)
	orgs.Get("/:id", middleware.RBACWithResourceCheck(models.ResourceOrganization, models.ActionRead), orgHandler.Get)
	orgs.Post("/", middleware.RequirePermission(models.ResourceOrganization, models.ActionCreate), orgHandler.Create)
	orgs.Put("/:id", middleware.RBACWithResourceCheck(models.ResourceOrganization, models.ActionUpdate), orgHandler.Update)
	orgs.Delete("/:id", middleware.RBACWithResourceCheck(models.ResourceOrganization, models.ActionDelete), orgHandler.Delete)
	orgs.Get("/:id/members", middleware.RBACWithResourceCheck(models.ResourceOrganization, models.ActionRead), orgHandler.GetMembers)
	orgs.Get("/:id/stats", middleware.RBACWithResourceCheck(models.ResourceOrganization, models.ActionRead), orgHandler.GetStats)

	// Events - with RBAC permission checking
	events := protected.Group("/events")
	events.Get("/", middleware.RequirePermission(models.ResourceEvent, models.ActionList), eventHandler.List)
	events.Get("/:id", middleware.RBACWithResourceCheck(models.ResourceEvent, models.ActionRead), eventHandler.Get)
	events.Post("/", middleware.RequirePermission(models.ResourceEvent, models.ActionCreate), eventHandler.Create)
	events.Put("/:id", middleware.RBACWithResourceCheck(models.ResourceEvent, models.ActionUpdate), eventHandler.Update)
	events.Delete("/:id", middleware.RBACWithResourceCheck(models.ResourceEvent, models.ActionDelete), eventHandler.Delete)
	events.Post("/:id/register", eventHandler.Register) // All members can register
	events.Post("/:id/attendance", middleware.RBACWithResourceCheck(models.ResourceEvent, models.ActionUpdate), eventHandler.MarkAttendance)
	events.Get("/:id/participants", middleware.RBACWithResourceCheck(models.ResourceEvent, models.ActionRead), eventHandler.GetParticipants)

	// Membership Fees - with RBAC permission checking
	fees := protected.Group("/fees")
	fees.Get("/", middleware.RequirePermission(models.ResourceFee, models.ActionList), feeHandler.List)
	fees.Get("/:id", middleware.RBACWithResourceCheck(models.ResourceFee, models.ActionRead), feeHandler.Get)
	fees.Post("/", middleware.RequirePermission(models.ResourceFee, models.ActionCreate), feeHandler.Create)
	fees.Put("/:id", middleware.RBACWithResourceCheck(models.ResourceFee, models.ActionUpdate), feeHandler.Update)
	fees.Get("/member/:memberId", middleware.RequirePermission(models.ResourceFee, models.ActionRead), feeHandler.GetByMember)
	fees.Post("/bulk", middleware.RequirePermission(models.ResourceFee, models.ActionImport), feeHandler.BulkCreate)

	// Reports - with RBAC permission checking
	reports := protected.Group("/reports")
	reports.Get("/members", middleware.RequirePermission(models.ResourceReport, models.ActionRead), memberHandler.Report)
	reports.Get("/fees", middleware.RequirePermission(models.ResourceReport, models.ActionRead), feeHandler.Report)
	reports.Get("/events", middleware.RequirePermission(models.ResourceReport, models.ActionRead), eventHandler.Report)
	reports.Get("/dashboard", middleware.RequirePermission(models.ResourceReport, models.ActionRead), handlers.DashboardReport)
	reports.Get("/export/:type", middleware.RequirePermission(models.ResourceReport, models.ActionExport), handlers.ExportReport)

	// Profile (self)
	protected.Get("/profile", memberHandler.GetProfile)
	protected.Put("/profile", memberHandler.UpdateProfile)
	protected.Get("/profile/fees", feeHandler.GetMyFees)
	protected.Get("/profile/events", eventHandler.GetMyEvents)

	// Admin endpoints - Settings and Audit Logs (national_admin only)
	admin := protected.Group("/admin", middleware.RequirePermission(models.ResourceSettings, models.ActionRead))
	admin.Get("/audit-logs", handlers.GetAuditLogs(authzService))
	admin.Get("/permissions", handlers.GetPermissionMatrix)

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := app.Listen(":" + cfg.Port); err != nil {
			log.Fatal().Err(err).Msg("Server failed to start")
		}
	}()

	log.Info().Str("port", cfg.Port).Msg("Server started")

	<-quit
	log.Info().Msg("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := app.ShutdownWithContext(ctx); err != nil {
		log.Fatal().Err(err).Msg("Server forced to shutdown")
	}

	log.Info().Msg("Server exited properly")
}
