package models

import "time"

type Stats struct {
	Organizations int `json:"organizations"`
	Beneficiaries int `json:"beneficiaries"`
	FundingRp     int `json:"fundingRp"`
}

type NewsItem struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Summary     string    `json:"summary"`
	Tag         string    `json:"tag"`
	TagColor    string    `json:"tagColor"`
	PublishedAt time.Time `json:"publishedAt"`
}

type Member struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Category     string `json:"category"`
	Contribution string `json:"contribution"`
}

type Campaign struct {
	ID          int     `json:"id"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Target      int     `json:"target"`
	Collected   int     `json:"collected"`
	Percentage  float64 `json:"percentage"`
}

type Donation struct {
	ID        int       `json:"id"`
	Amount    int       `json:"amount"`
	Program   string    `json:"program"`
	DonorName string    `json:"donorName"`
	Email     string    `json:"email"`
	Type      string    `json:"type"` // "once" or "monthly"
	CreatedAt time.Time `json:"createdAt"`
}

type ContactSubmission struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Category     string    `json:"category"`
	Contact      string    `json:"contact"`
	Interest     string    `json:"interest"`
	Message      string    `json:"message"`
	SubmittedAt  time.Time `json:"submittedAt"`
}
