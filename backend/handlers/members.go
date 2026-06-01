package handlers

import (
	"context"
	"strconv"
	"time"

	"kobber-backend/db"
	"kobber-backend/models"

	"github.com/gofiber/fiber/v2"
)

func GetMembers(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := db.Pool.Query(ctx, "SELECT id, name, category, contribution FROM members ORDER BY id")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch members"})
	}
	defer rows.Close()

	members := []models.Member{}
	for rows.Next() {
		var m models.Member
		if err := rows.Scan(&m.ID, &m.Name, &m.Category, &m.Contribution); err != nil {
			continue
		}
		members = append(members, m)
	}

	return c.JSON(members)
}

func GetMemberByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var m models.Member
	err = db.Pool.QueryRow(ctx, "SELECT id, name, category, contribution FROM members WHERE id=$1", id).
		Scan(&m.ID, &m.Name, &m.Category, &m.Contribution)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Member not found"})
	}

	return c.JSON(m)
}

type CreateMemberInput struct {
	Name         string `json:"name"`
	Category     string `json:"category"`
	Contribution string `json:"contribution"`
}

func CreateMember(c *fiber.Ctx) error {
	var input CreateMemberInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	if input.Name == "" || input.Category == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Name and category are required"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var m models.Member
	err := db.Pool.QueryRow(ctx,
		"INSERT INTO members (name, category, contribution) VALUES ($1,$2,$3) RETURNING id, name, category, contribution",
		input.Name, input.Category, input.Contribution,
	).Scan(&m.ID, &m.Name, &m.Category, &m.Contribution)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create member"})
	}

	return c.Status(fiber.StatusCreated).JSON(m)
}

func UpdateMember(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	var input CreateMemberInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var m models.Member
	err = db.Pool.QueryRow(ctx,
		"UPDATE members SET name=COALESCE(NULLIF($1,''), name), category=COALESCE(NULLIF($2,''), category), contribution=COALESCE(NULLIF($3,''), contribution) WHERE id=$4 RETURNING id, name, category, contribution",
		input.Name, input.Category, input.Contribution, id,
	).Scan(&m.ID, &m.Name, &m.Category, &m.Contribution)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Member not found"})
	}

	return c.JSON(m)
}

func DeleteMember(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	tag, err := db.Pool.Exec(ctx, "DELETE FROM members WHERE id=$1", id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete"})
	}
	if tag.RowsAffected() == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Member not found"})
	}

	return c.JSON(fiber.Map{"message": "Deleted"})
}
