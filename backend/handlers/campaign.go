package handlers

import (
	"context"
	"time"

	"kobber-backend/db"
	"kobber-backend/models"

	"github.com/gofiber/fiber/v2"
)

func GetCampaign(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var camp models.Campaign
	err := db.Pool.QueryRow(ctx, "SELECT id, title, description, target, collected, percentage FROM campaigns LIMIT 1").
		Scan(&camp.ID, &camp.Title, &camp.Description, &camp.Target, &camp.Collected, &camp.Percentage)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch campaign"})
	}

	return c.JSON(camp)
}
