package handlers

import (
	"context"
	"strconv"
	"time"

	"kobber-backend/db"
	"kobber-backend/models"

	"github.com/gofiber/fiber/v2"
)

func GetNews(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := db.Pool.Query(ctx, "SELECT id, title, summary, tag, tag_color, published_at FROM news_items ORDER BY published_at DESC")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch news"})
	}
	defer rows.Close()

	news := []models.NewsItem{}
	for rows.Next() {
		var n models.NewsItem
		if err := rows.Scan(&n.ID, &n.Title, &n.Summary, &n.Tag, &n.TagColor, &n.PublishedAt); err != nil {
			continue
		}
		news = append(news, n)
	}

	return c.JSON(news)
}

func GetNewsByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var n models.NewsItem
	err = db.Pool.QueryRow(ctx, "SELECT id, title, summary, tag, tag_color, published_at FROM news_items WHERE id=$1", id).
		Scan(&n.ID, &n.Title, &n.Summary, &n.Tag, &n.TagColor, &n.PublishedAt)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "News not found"})
	}

	return c.JSON(n)
}

type CreateNewsInput struct {
	Title    string `json:"title"`
	Summary  string `json:"summary"`
	Tag      string `json:"tag"`
	TagColor string `json:"tagColor"`
}

func CreateNews(c *fiber.Ctx) error {
	var input CreateNewsInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	if input.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Title is required"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var n models.NewsItem
	err := db.Pool.QueryRow(ctx,
		"INSERT INTO news_items (title, summary, tag, tag_color, published_at) VALUES ($1,$2,$3,$4,$5) RETURNING id, title, summary, tag, tag_color, published_at",
		input.Title, input.Summary, input.Tag, input.TagColor, time.Now(),
	).Scan(&n.ID, &n.Title, &n.Summary, &n.Tag, &n.TagColor, &n.PublishedAt)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create news"})
	}

	return c.Status(fiber.StatusCreated).JSON(n)
}

type UpdateNewsInput struct {
	Title    string `json:"title"`
	Summary  string `json:"summary"`
	Tag      string `json:"tag"`
	TagColor string `json:"tagColor"`
}

func UpdateNews(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	var input UpdateNewsInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Build dynamic update
	var n models.NewsItem
	err = db.Pool.QueryRow(ctx,
		"UPDATE news_items SET title=COALESCE(NULLIF($1,''), title), summary=COALESCE(NULLIF($2,''), summary), tag=COALESCE(NULLIF($3,''), tag), tag_color=COALESCE(NULLIF($4,''), tag_color) WHERE id=$5 RETURNING id, title, summary, tag, tag_color, published_at",
		input.Title, input.Summary, input.Tag, input.TagColor, id,
	).Scan(&n.ID, &n.Title, &n.Summary, &n.Tag, &n.TagColor, &n.PublishedAt)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "News not found"})
	}

	return c.JSON(n)
}

func DeleteNews(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	tag, err := db.Pool.Exec(ctx, "DELETE FROM news_items WHERE id=$1", id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete"})
	}
	if tag.RowsAffected() == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "News not found"})
	}

	return c.JSON(fiber.Map{"message": "Deleted"})
}
