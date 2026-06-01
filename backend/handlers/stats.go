package handlers

import (
	"context"
	"time"

	"kobber-backend/db"
	"kobber-backend/models"

	"github.com/gofiber/fiber/v2"
)

func GetStats(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get base stats
	var stats models.Stats
	err := db.Pool.QueryRow(ctx, "SELECT organizations, beneficiaries, funding_rp FROM stats LIMIT 1").
		Scan(&stats.Organizations, &stats.Beneficiaries, &stats.FundingRp)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch stats"})
	}

	// Calculate actual funding from donations
	var totalFunding int
	err = db.Pool.QueryRow(ctx, "SELECT COALESCE(SUM(amount), 0) FROM donations").Scan(&totalFunding)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to calculate funding"})
	}

	stats.FundingRp = totalFunding

	return c.JSON(stats)
}
