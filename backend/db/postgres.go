package db

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func Connect(databaseURL string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return fmt.Errorf("parse config: %w", err)
	}

	config.MaxConns = 10

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return fmt.Errorf("create pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return fmt.Errorf("ping: %w", err)
	}

	Pool = pool
	log.Println("Connected to PostgreSQL")
	return nil
}

func Migrate(ctx context.Context) error {
	schema := `
	CREATE TABLE IF NOT EXISTS stats (
		id SERIAL PRIMARY KEY,
		organizations INT NOT NULL DEFAULT 0,
		beneficiaries INT NOT NULL DEFAULT 0,
		funding_rp BIGINT NOT NULL DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS news_items (
		id SERIAL PRIMARY KEY,
		title TEXT NOT NULL,
		summary TEXT NOT NULL DEFAULT '',
		tag TEXT NOT NULL DEFAULT '',
		tag_color TEXT NOT NULL DEFAULT '',
		published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS members (
		id SERIAL PRIMARY KEY,
		name TEXT NOT NULL,
		category TEXT NOT NULL DEFAULT '',
		contribution TEXT NOT NULL DEFAULT ''
	);

	CREATE TABLE IF NOT EXISTS campaigns (
		id SERIAL PRIMARY KEY,
		title TEXT NOT NULL,
		description TEXT NOT NULL DEFAULT '',
		target BIGINT NOT NULL DEFAULT 0,
		collected BIGINT NOT NULL DEFAULT 0,
		percentage DOUBLE PRECISION NOT NULL DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS donations (
		id SERIAL PRIMARY KEY,
		amount BIGINT NOT NULL,
		program TEXT NOT NULL DEFAULT '',
		donor_name TEXT NOT NULL DEFAULT '',
		email TEXT NOT NULL DEFAULT '',
		type TEXT NOT NULL DEFAULT 'once',
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS contact_submissions (
		id SERIAL PRIMARY KEY,
		name TEXT NOT NULL,
		category TEXT NOT NULL DEFAULT '',
		contact TEXT NOT NULL DEFAULT '',
		interest TEXT NOT NULL DEFAULT '',
		message TEXT NOT NULL DEFAULT '',
		submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);
	`

	_, err := Pool.Exec(ctx, schema)
	if err != nil {
		return fmt.Errorf("migrate: %w", err)
	}
	log.Println("Database schema migrated")
	return nil
}

func Seed(ctx context.Context) error {
	// Only seed if tables are empty
	var count int
	err := Pool.QueryRow(ctx, "SELECT COUNT(*) FROM stats").Scan(&count)
	if err != nil {
		return fmt.Errorf("check stats: %w", err)
	}
	if count > 0 {
		log.Println("Database already seeded, skipping")
		return nil
	}

	tx, err := Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	// Stats
	_, err = tx.Exec(ctx, "INSERT INTO stats (organizations, beneficiaries, funding_rp) VALUES ($1, $2, $3)",
		57, 1248, 286000000)
	if err != nil {
		return fmt.Errorf("seed stats: %w", err)
	}

	// News (8 items)
	news := []struct {
		title, summary, tag, tagColor string
		publishedAt                   time.Time
	}{
		{"Forum lintas sektor menyusun agenda stunting 2026", "Perwakilan dari 20 lembaga berkumpul untuk menyusun rencana aksi bersama percepatan penurunan stunting di Brebes.", "Berita terbaru", "green", time.Date(2026, 5, 20, 0, 0, 0, 0, time.UTC)},
		{"Pelatihan kader posyandu se-Kecamatan Bumiayu", "50 kader posyandu mengikuti pelatihan deteksi dini risiko ibu hamil dan pengukuran antropometri balita.", "Kegiatan", "blue", time.Date(2026, 5, 15, 0, 0, 0, 0, time.UTC)},
		{"Cerita Ibu Sartini: dari risiko tinggi pulih sempurna", "Berkat rujukan cepat dan pendampingan, Ibu Sartini berhasil melahirkan secara selamat meski tergolong risiko tinggi.", "Kisah perubahan", "gold", time.Date(2026, 5, 10, 0, 0, 0, 0, time.UTC)},
		{"Launching dashboard data KIA Brebes", "KOBBER bersama Dinkes Brebes meluncurkan dashboard data kesehatan ibu dan anak yang dapat diakses publik.", "Berita terbaru", "green", time.Date(2026, 5, 5, 0, 0, 0, 0, time.UTC)},
		{"Rakor anggota forum triwulan II", "Evaluasi program triwulan I dan penyusunan rencana aksi triwulan berikutnya dengan seluruh anggota forum.", "Kegiatan", "blue", time.Date(2026, 4, 28, 0, 0, 0, 0, time.UTC)},
		{"Program USG keliling menjangkau 12 desa", "Layanan USG keliling telah menjangkau 12 desa prioritas dengan total 240 ibu hamil terperiksa.", "Program", "green", time.Date(2026, 4, 20, 0, 0, 0, 0, time.UTC)},
		{"Testimoni kader desa tentang perubahan warga", "Para kader melaporkan perubahan positif perilaku warga setelah pendampingan rutin oleh tim lapangan.", "Kisah perubahan", "gold", time.Date(2026, 4, 12, 0, 0, 0, 0, time.UTC)},
		{"Kolaborasi CSR untuk paket gizi balita", "Tiga perusahaan mitra menyalurkan paket gizi untuk 500 balita di wilayah prioritas.", "Kemitraan", "blue", time.Date(2026, 4, 5, 0, 0, 0, 0, time.UTC)},
	}
	for _, n := range news {
		_, err = tx.Exec(ctx, "INSERT INTO news_items (title, summary, tag, tag_color, published_at) VALUES ($1,$2,$3,$4,$5)",
			n.title, n.summary, n.tag, n.tagColor, n.publishedAt)
		if err != nil {
			return fmt.Errorf("seed news: %w", err)
		}
	}

	// Members (12 items)
	members := []struct {
		name, category, contribution string
	}{
		{"RSUD Brebes", "RS", "Rujukan & layanan kolaboratif"},
		{"RS Mitra Swasta", "RS", "Layanan darurat & USG"},
		{"RS Islam Brebes", "RS", "Pelayanan ibu hamil risiko tinggi"},
		{"Universitas Jenderal Soedirman", "Universitas", "Riset, magang, data KIA"},
		{"Universitas Brebes", "Universitas", "Penelitian stunting dan gizi"},
		{"Poltekkes Kemenkes Semarang", "Universitas", "Pendidikan kader dan magang"},
		{"Yayasan Peduli Anak", "NGO", "Program gizi balita"},
		{"Lembaga Mitra Brebes", "NGO", "Pendampingan warga dan advokasi"},
		{"Yayasan ESKA", "NGO", "Penaung operasional forum"},
		{"PT Indofarma Tbk", "Perusahaan", "CSR kesehatan ibu dan anak"},
		{"Bank Jateng", "Perusahaan", "Program CSR stunting"},
		{"Ormas Fatayat NU Brebes", "Ormas", "Pendampingan kader posyandu"},
	}
	for _, m := range members {
		_, err = tx.Exec(ctx, "INSERT INTO members (name, category, contribution) VALUES ($1,$2,$3)",
			m.name, m.category, m.contribution)
		if err != nil {
			return fmt.Errorf("seed member: %w", err)
		}
	}

	// Campaign
	_, err = tx.Exec(ctx, "INSERT INTO campaigns (title, description, target, collected, percentage) VALUES ($1,$2,$3,$4,$5)",
		"Selamatkan Ibu dan Anak Brebes", "Donasi Anda membantu pemeriksaan ibu hamil berisiko tinggi dan transport rujukan darurat.",
		100000000, 74000000, 74.0)
	if err != nil {
		return fmt.Errorf("seed campaign: %w", err)
	}

	// Donations (10 items)
	donations := []struct {
		amount    int
		program   string
		donorName string
		email     string
		typ       string
		createdAt time.Time
	}{
		{50000, "USG ibu hamil", "Anonymous", "", "once", time.Date(2026, 5, 25, 0, 0, 0, 0, time.UTC)},
		{100000, "Paket gizi balita", "PT Sejahtera", "cs@sejahtera.id", "monthly", time.Date(2026, 5, 20, 0, 0, 0, 0, time.UTC)},
		{250000, "Persalinan darurat", "Yayasan Kasih", "info@kasih.org", "once", time.Date(2026, 5, 18, 0, 0, 0, 0, time.UTC)},
		{75000, "USG ibu hamil", "Bpk. Ahmad Fauzi", "ahmad@email.com", "once", time.Date(2026, 5, 15, 0, 0, 0, 0, time.UTC)},
		{150000, "Paket gizi balita", "Ibu Siti Nurhaliza", "siti@gmail.com", "once", time.Date(2026, 5, 12, 0, 0, 0, 0, time.UTC)},
		{500000, "Persalinan darurat", "CV. Mitra Utama", "finance@mitrautama.co.id", "once", time.Date(2026, 5, 10, 0, 0, 0, 0, time.UTC)},
		{200000, "USG ibu hamil", "Anonymous", "", "monthly", time.Date(2026, 5, 8, 0, 0, 0, 0, time.UTC)},
		{100000, "Paket gizi balita", "Ibu Ratna Dewi", "ratna@yahoo.com", "once", time.Date(2026, 5, 5, 0, 0, 0, 0, time.UTC)},
		{300000, "Persalinan darurat", "PT IndoSehat", "info@indosehat.co.id", "once", time.Date(2026, 5, 3, 0, 0, 0, 0, time.UTC)},
		{85000, "USG ibu hamil", "Komunitas Peduli Brebes", "kpb@komunitas.org", "monthly", time.Date(2026, 5, 1, 0, 0, 0, 0, time.UTC)},
	}
	for _, d := range donations {
		_, err = tx.Exec(ctx, "INSERT INTO donations (amount, program, donor_name, email, type, created_at) VALUES ($1,$2,$3,$4,$5,$6)",
			d.amount, d.program, d.donorName, d.email, d.typ, d.createdAt)
		if err != nil {
			return fmt.Errorf("seed donation: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit seed: %w", err)
	}

	log.Println("Database seeded successfully")
	return nil
}

func Close() {
	if Pool != nil {
		Pool.Close()
	}
}
