package handlers

import (
	"context"
	"time"

	"kobber-backend/db"
	"kobber-backend/models"

	"github.com/gofiber/fiber/v2"
)

func GetDonations(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := db.Pool.Query(ctx, "SELECT id, amount, program, donor_name, email, type, created_at FROM donations ORDER BY created_at DESC")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch donations"})
	}
	defer rows.Close()

	donations := []models.Donation{}
	for rows.Next() {
		var d models.Donation
		if err := rows.Scan(&d.ID, &d.Amount, &d.Program, &d.DonorName, &d.Email, &d.Type, &d.CreatedAt); err != nil {
			continue
		}
		donations = append(donations, d)
	}

	return c.JSON(donations)
}

type CreateDonationInput struct {
	Amount    int    `json:"amount"`
	Program   string `json:"program"`
	DonorName string `json:"donorName"`
	Email     string `json:"email"`
	Type      string `json:"type"`
}

func CreateDonation(c *fiber.Ctx) error {
	var input CreateDonationInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	if input.Amount <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Amount must be positive"})
	}
	if input.Type == "" {
		input.Type = "once"
	}
	if input.Type != "once" && input.Type != "monthly" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Type must be 'once' or 'monthly'"})
	}
	if input.DonorName == "" {
		input.DonorName = "Anonymous"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to process donation"})
	}
	defer tx.Rollback(ctx)

	// Insert donation
	var d models.Donation
	err = tx.QueryRow(ctx,
		"INSERT INTO donations (amount, program, donor_name, email, type, created_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, amount, program, donor_name, email, type, created_at",
		input.Amount, input.Program, input.DonorName, input.Email, input.Type, time.Now(),
	).Scan(&d.ID, &d.Amount, &d.Program, &d.DonorName, &d.Email, &d.Type, &d.CreatedAt)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save donation"})
	}

	// Update campaign collected amount
	_, err = tx.Exec(ctx,
		"UPDATE campaigns SET collected = collected + $1, percentage = ((collected + $1)::float / target) * 100 WHERE id = 1",
		input.Amount,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update campaign"})
	}

	if err := tx.Commit(ctx); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to finalize donation"})
	}

	return c.Status(fiber.StatusCreated).JSON(d)
}
