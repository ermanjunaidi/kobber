package handlers

import (
	"context"
	"regexp"
	"strings"
	"time"

	"kobber-backend/db"
	"kobber-backend/models"

	"github.com/gofiber/fiber/v2"
)

type CreateContactInput struct {
	Name     string `json:"name"`
	Category string `json:"category"`
	Contact  string `json:"contact"`
	Interest string `json:"interest"`
	Message  string `json:"message"`
}

func CreateContact(c *fiber.Ctx) error {
	var input CreateContactInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	if strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.Contact) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Name and contact are required"})
	}
	// Basic email validation if it looks like an email
	if strings.Contains(input.Contact, "@") {
		emailRegex := regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
		if !emailRegex.MatchString(input.Contact) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid email format"})
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var s models.ContactSubmission
	err := db.Pool.QueryRow(ctx,
		"INSERT INTO contact_submissions (name, category, contact, interest, message, submitted_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, category, contact, interest, message, submitted_at",
		strings.TrimSpace(input.Name), input.Category, strings.TrimSpace(input.Contact), input.Interest, input.Message, time.Now(),
	).Scan(&s.ID, &s.Name, &s.Category, &s.Contact, &s.Interest, &s.Message, &s.SubmittedAt)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to submit contact"})
	}

	return c.Status(fiber.StatusCreated).JSON(s)
}

func GetContacts(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := db.Pool.Query(ctx, "SELECT id, name, category, contact, interest, message, submitted_at FROM contact_submissions ORDER BY id DESC")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch contacts"})
	}
	defer rows.Close()

	contacts := []models.ContactSubmission{}
	for rows.Next() {
		var s models.ContactSubmission
		if err := rows.Scan(&s.ID, &s.Name, &s.Category, &s.Contact, &s.Interest, &s.Message, &s.SubmittedAt); err != nil {
			continue
		}
		contacts = append(contacts, s)
	}

	return c.JSON(contacts)
}
