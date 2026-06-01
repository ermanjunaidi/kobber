package handlers

import (
	"context"
	"time"

	"kobber-backend/db"

	"github.com/gofiber/fiber/v2"
)

type AdminStats struct {
	TotalNews        int `json:"totalNews"`
	TotalMembers     int `json:"totalMembers"`
	TotalDonations   int `json:"totalDonations"`
	TotalDonationRp  int `json:"totalDonationRp"`
	TotalContacts    int `json:"totalContacts"`
	CampaignProgress struct {
		Collected int     `json:"collected"`
		Target    int     `json:"target"`
		Percentage float64 `json:"percentage"`
	} `json:"campaignProgress"`
}

func GetAdminStats(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var stats AdminStats

	// News count
	_ = db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM news_items").Scan(&stats.TotalNews)

	// Members count
	_ = db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM members").Scan(&stats.TotalMembers)

	// Donations count and sum
	_ = db.Pool.QueryRow(ctx, "SELECT COUNT(*), COALESCE(SUM(amount), 0) FROM donations").Scan(&stats.TotalDonations, &stats.TotalDonationRp)

	// Contacts count
	_ = db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM contact_submissions").Scan(&stats.TotalContacts)

	// Campaign progress
	err := db.Pool.QueryRow(ctx, "SELECT collected, target, percentage FROM campaigns LIMIT 1").
		Scan(&stats.CampaignProgress.Collected, &stats.CampaignProgress.Target, &stats.CampaignProgress.Percentage)
	if err != nil {
		stats.CampaignProgress.Collected = 0
		stats.CampaignProgress.Target = 0
		stats.CampaignProgress.Percentage = 0
	}

	return c.JSON(stats)
}
