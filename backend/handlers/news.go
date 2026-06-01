package handlers

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"kobber-backend/db"
	"kobber-backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func GetNews(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := db.Pool.Query(ctx, "SELECT id, title, summary, tag, tag_color, image_url, published_at FROM news_items ORDER BY published_at DESC")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch news"})
	}
	defer rows.Close()

	news := []models.NewsItem{}
	for rows.Next() {
		var n models.NewsItem
		if err := rows.Scan(&n.ID, &n.Title, &n.Summary, &n.Tag, &n.TagColor, &n.ImageURL, &n.PublishedAt); err != nil {
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
	err = db.Pool.QueryRow(ctx, "SELECT id, title, summary, tag, tag_color, image_url, published_at FROM news_items WHERE id=$1", id).
		Scan(&n.ID, &n.Title, &n.Summary, &n.Tag, &n.TagColor, &n.ImageURL, &n.PublishedAt)
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
	ImageURL string `json:"imageUrl"`
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
		"INSERT INTO news_items (title, summary, tag, tag_color, image_url, published_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, title, summary, tag, tag_color, image_url, published_at",
		input.Title, input.Summary, input.Tag, input.TagColor, input.ImageURL, time.Now(),
	).Scan(&n.ID, &n.Title, &n.Summary, &n.Tag, &n.TagColor, &n.ImageURL, &n.PublishedAt)
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
	ImageURL string `json:"imageUrl"`
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

	var n models.NewsItem
	err = db.Pool.QueryRow(ctx,
		"UPDATE news_items SET title=COALESCE(NULLIF($1,''), title), summary=COALESCE(NULLIF($2,''), summary), tag=COALESCE(NULLIF($3,''), tag), tag_color=COALESCE(NULLIF($4,''), tag_color), image_url=COALESCE(NULLIF($5,''), image_url) WHERE id=$6 RETURNING id, title, summary, tag, tag_color, image_url, published_at",
		input.Title, input.Summary, input.Tag, input.TagColor, input.ImageURL, id,
	).Scan(&n.ID, &n.Title, &n.Summary, &n.Tag, &n.TagColor, &n.ImageURL, &n.PublishedAt)
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

	// Get image URL first to clean up file
	var imageURL string
	_ = db.Pool.QueryRow(ctx, "SELECT image_url FROM news_items WHERE id=$1", id).Scan(&imageURL)

	tag, err := db.Pool.Exec(ctx, "DELETE FROM news_items WHERE id=$1", id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete"})
	}
	if tag.RowsAffected() == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "News not found"})
	}

	// Clean up uploaded image file
	if imageURL != "" {
		cleanupFile(imageURL)
	}

	return c.JSON(fiber.Map{"message": "Deleted"})
}

// UploadNewsImage handles image upload for a news item
func UploadNewsImage(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	// Get the uploaded file
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Image file is required"})
	}

	// Validate file type
	ext := filepath.Ext(file.Filename)
	allowedExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true}
	if !allowedExts[ext] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Only JPG, PNG, WebP, and GIF files are allowed"})
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "File size must be less than 5MB"})
	}

	// Create uploads directory if not exists
	uploadsDir := "./uploads"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create upload directory"})
	}

	// Generate unique filename
	filename := fmt.Sprintf("news_%d_%s%s", id, uuid.New().String()[:8], ext)
	filePath := filepath.Join(uploadsDir, filename)

	// Save file
	src, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to open file"})
	}
	defer src.Close()

	dst, err := os.Create(filePath)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
	}
	defer dst.Close()

	if _, err = io.Copy(dst, src); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
	}

	// Get old image URL to clean up
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var oldImageURL string
	_ = db.Pool.QueryRow(ctx, "SELECT image_url FROM news_items WHERE id=$1", id).Scan(&oldImageURL)

	// Update news item with new image URL
	imageURL := "/uploads/" + filename
	_, err = db.Pool.Exec(ctx, "UPDATE news_items SET image_url=$1 WHERE id=$2", imageURL, id)
	if err != nil {
		// Clean up uploaded file if DB update fails
		os.Remove(filePath)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update news image"})
	}

	// Clean up old image
	if oldImageURL != "" {
		cleanupFile(oldImageURL)
	}

	return c.JSON(fiber.Map{"imageUrl": imageURL, "message": "Image uploaded successfully"})
}

func cleanupFile(url string) {
	// Extract path from URL like /uploads/filename.jpg
	if len(url) > 9 && url[:9] == "/uploads/" {
		filePath := "." + url
		os.Remove(filePath)
	}
}
