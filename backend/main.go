package main

import (
	"context"
	"log"
	"os"

	"kobber-backend/db"
	"kobber-backend/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	// Database connection
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://kobber:kobber123@localhost:5433/kobber?sslmode=disable"
	}

	if err := db.Connect(databaseURL); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Migrate schema
	ctx := context.Background()
	if err := db.Migrate(ctx); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Seed data
	if err := db.Seed(ctx); err != nil {
		log.Fatalf("Failed to seed database: %v", err)
	}

	app := fiber.New()

	// CORS — allow frontend origin
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173,http://localhost:4173,http://frontend:5173",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// API routes
	api := app.Group("/api")

	// Health
	api.Get("/health", handlers.HealthCheck)

	// Stats
	api.Get("/stats", handlers.GetStats)

	// News
	api.Get("/news", handlers.GetNews)
	api.Get("/news/:id", handlers.GetNewsByID)
	api.Post("/news", handlers.CreateNews)
	api.Put("/news/:id", handlers.UpdateNews)
	api.Delete("/news/:id", handlers.DeleteNews)

	// Members
	api.Get("/members", handlers.GetMembers)
	api.Get("/members/:id", handlers.GetMemberByID)
	api.Post("/members", handlers.CreateMember)
	api.Put("/members/:id", handlers.UpdateMember)
	api.Delete("/members/:id", handlers.DeleteMember)

	// Campaign
	api.Get("/campaign", handlers.GetCampaign)

	// Donations
	api.Get("/donations", handlers.GetDonations)
	api.Post("/donations", handlers.CreateDonation)

	// Contact
	api.Post("/contact", handlers.CreateContact)
	api.Get("/contact", handlers.GetContacts)

	// Auth (login — no middleware)
	api.Post("/auth/login", handlers.Login)

	// Admin (protected with JWT middleware)
	admin := api.Group("/admin", handlers.AuthMiddleware)
	admin.Get("/stats", handlers.GetAdminStats)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("KOBBER Backend running on :%s", port)
	log.Fatal(app.Listen(":" + port))
}
