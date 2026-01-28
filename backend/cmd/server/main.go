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
	authService := services.NewAuthService(cfg, rdb)

	// Initialize Keycloak validator
	if err := middleware.InitKeycloakValidator(cfg); err != nil {
		log.Warn().Err(err).Msg("Failed to initialize Keycloak validator, falling back to legacy JWT auth")
	} else {
		log.Info().Msg("Keycloak JWT validation enabled")
	}

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

	// Protected routes - use Keycloak JWT validation
	protected := api.Group("", middleware.KeycloakJWTAuth())

	// Members
	members := protected.Group("/members")
	members.Get("/", memberHandler.List)
	members.Get("/:id", memberHandler.Get)
	members.Post("/", middleware.RequireRole("national_admin", "province_admin", "district_admin"), memberHandler.Create)
	members.Put("/:id", middleware.RequireRole("national_admin", "province_admin", "district_admin"), memberHandler.Update)
	members.Delete("/:id", middleware.RequireRole("national_admin"), memberHandler.Delete)
	members.Get("/:id/history", memberHandler.GetHistory)
	members.Post("/:id/status", middleware.RequireRole("national_admin", "province_admin"), memberHandler.UpdateStatus)

	// Organizations
	orgs := protected.Group("/organizations")
	orgs.Get("/", orgHandler.List)
	orgs.Get("/:id", orgHandler.Get)
	orgs.Post("/", middleware.RequireRole("national_admin"), orgHandler.Create)
	orgs.Put("/:id", middleware.RequireRole("national_admin", "province_admin"), orgHandler.Update)
	orgs.Delete("/:id", middleware.RequireRole("national_admin"), orgHandler.Delete)
	orgs.Get("/:id/members", orgHandler.GetMembers)
	orgs.Get("/:id/stats", orgHandler.GetStats)

	// Events
	events := protected.Group("/events")
	events.Get("/", eventHandler.List)
	events.Get("/:id", eventHandler.Get)
	events.Post("/", middleware.RequireRole("national_admin", "province_admin", "district_admin"), eventHandler.Create)
	events.Put("/:id", middleware.RequireRole("national_admin", "province_admin", "district_admin"), eventHandler.Update)
	events.Delete("/:id", middleware.RequireRole("national_admin", "province_admin"), eventHandler.Delete)
	events.Post("/:id/register", eventHandler.Register)
	events.Post("/:id/attendance", middleware.RequireRole("national_admin", "province_admin", "district_admin"), eventHandler.MarkAttendance)
	events.Get("/:id/participants", eventHandler.GetParticipants)

	// Membership Fees
	fees := protected.Group("/fees")
	fees.Get("/", feeHandler.List)
	fees.Get("/:id", feeHandler.Get)
	fees.Post("/", middleware.RequireRole("national_admin", "province_admin", "district_admin"), feeHandler.Create)
	fees.Put("/:id", middleware.RequireRole("national_admin", "province_admin", "district_admin"), feeHandler.Update)
	fees.Get("/member/:memberId", feeHandler.GetByMember)
	fees.Post("/bulk", middleware.RequireRole("national_admin"), feeHandler.BulkCreate)

	// Reports (admin only)
	reports := protected.Group("/reports", middleware.RequireRole("national_admin", "province_admin"))
	reports.Get("/members", memberHandler.Report)
	reports.Get("/fees", feeHandler.Report)
	reports.Get("/events", eventHandler.Report)
	reports.Get("/dashboard", handlers.DashboardReport)

	// Profile (self)
	protected.Get("/profile", memberHandler.GetProfile)
	protected.Put("/profile", memberHandler.UpdateProfile)
	protected.Get("/profile/fees", feeHandler.GetMyFees)
	protected.Get("/profile/events", eventHandler.GetMyEvents)

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
