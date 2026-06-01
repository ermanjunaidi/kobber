package handlers

import (
	"context"
	"time"

	"kobber-backend/db"

	"github.com/gofiber/fiber/v2"
)

func HealthCheck(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := db.Pool.Ping(ctx)
	if err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"status":  "error",
			"message": "Database connection failed",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "ok",
		"message": "KOBBER Backend is running",
	})
}
