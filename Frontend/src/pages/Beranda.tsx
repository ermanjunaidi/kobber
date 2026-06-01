import { useState, useEffect } from "react"
import { Link } from "react-router"
import { api, type Stats, type NewsItem, type Campaign } from "@/lib/api"
import { formatRp } from "@/lib/utils"

export default function Beranda() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [statsData, newsData, campaignData] = await Promise.all([
          api.stats(),
          api.news.list(),
          api.campaign(),
        ])
        setStats(statsData)
        setNews(newsData)
        setCampaign(campaignData)
      } catch (e) {
        console.error("Failed to load dashboard data:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const tagColors: Record<string, string> = {
    green: "k-accent-green",
    blue: "k-accent-blue",
    gold: "k-accent-gold",
    danger: "k-accent-danger",
  }

  return (
    <div className="k-page">
      {/* Hero */}
      <section className="k-hero">
        <div className="k-container k-hero-grid">
          <div className="k-hero-card">
            <span className="k-eyebrow">Forum multi-stakeholder Brebes</span>
            <h1>Bersama Menyelamatkan Ibu dan Anak Brebes.</h1>
            <p>KOBBER adalah platform informasi publik, layanan AI warga, kolaborasi anggota, dan fundraising transparan.</p>
            <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
              <Link to="/isu-brebes" className="k-btn k-btn-primary">
                Lihat Dampak Kami
              </Link>
              <Link to="/donasi" className="k-btn k-btn-secondary">
                Donasi Sekarang
              </Link>
              <Link to="/bergabung" className="k-btn k-btn-ghost">
                Gabung Forum
              </Link>
            </div>
            <div className="k-stats">
              <div className="k-metric">
                <strong>{stats ? `${stats.organizations}+` : "57+"}</strong>
                <span>Lembaga kolaborasi</span>
              </div>
              <div className="k-metric">
                <strong>{stats ? stats.beneficiaries.toLocaleString("id-ID") : "1.248"}</strong>
                <span>Penerima manfaat</span>
              </div>
              <div className="k-metric">
                <strong>{stats ? formatRp(stats.fundingRp) : "Rp 286jt"}</strong>
                <span>Dukungan terpetakan</span>
              </div>
            </div>
          </div>
          <div className="k-hero-visual">
            <div className="k-visual-caption">
              <strong>Foto lapangan nyata</strong>
              <p>Hero visual menampilkan ibu, anak, kader, dan kerja kolaboratif KOBBER.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Framing masalah */}
      <section className="k-section k-section-alt">
        <div className="k-container">
          <h2>Framing masalah</h2>
          <div className="k-grid-3" style={{ marginTop: "1rem" }}>
            <div className="k-card k-mini-chart">
              <strong>AKI Brebes</strong>
              <div className="k-bars">
                <span style={{ height: "55%" }} />
                <span style={{ height: "78%" }} />
                <span style={{ height: "70%" }} />
                <span style={{ height: "92%" }} />
                <span style={{ height: "68%" }} />
              </div>
            </div>
            <div className="k-card k-mini-chart">
              <strong>Stunting</strong>
              <div className="k-bars">
                <span style={{ height: "82%" }} />
                <span style={{ height: "76%" }} />
                <span style={{ height: "64%" }} />
                <span style={{ height: "59%" }} />
                <span style={{ height: "50%" }} />
              </div>
            </div>
            <div className="k-card k-mini-chart">
              <strong>Kemiskinan</strong>
              <div className="k-bars">
                <span style={{ height: "75%" }} />
                <span style={{ height: "72%" }} />
                <span style={{ height: "68%" }} />
                <span style={{ height: "60%" }} />
                <span style={{ height: "57%" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo + Donasi */}
      <section className="k-section">
        <div className="k-container k-split">
          <div className="k-panel">
            <h2>Strip logo anggota</h2>
            <div className="k-logos" style={{ marginTop: "1rem" }}>
              <div className="k-logo-chip">RS Mitra</div>
              <div className="k-logo-chip">NGO Lokal</div>
              <div className="k-logo-chip">Universitas</div>
              <div className="k-logo-chip">CSR Partner</div>
              <div className="k-logo-chip">Komunitas</div>
            </div>
          </div>
          <div className="k-panel k-panel-accent-gold">
            <h2>Kampanye donasi aktif</h2>
            <p>{campaign ? campaign.description : "Embed progress Kitabisa dan tombol donasi menonjol di seluruh halaman."}</p>
            <div className="k-kpi-bar">
              <i style={{ width: `${campaign ? campaign.percentage : 68}%` }} />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: ".65rem",
                fontWeight: 700,
              }}
            >
              <span>{campaign ? formatRp(campaign.collected) : "Rp 34.000.000"}</span>
              <span>{campaign ? `${Math.round(campaign.percentage)}%` : "68%"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Berita & Kisah */}
      <section className="k-section k-section-alt">
        <div className="k-container">
          <h2>Berita dan kisah lapangan</h2>
          <div className="k-news-grid" style={{ marginTop: "1rem" }}>
            {loading ? (
              <p className="k-text-muted">Memuat berita...</p>
            ) : (
              news.map((item) => (
                <article className="k-card" key={item.id}>
                  <span className={`k-tag ${tagColors[item.tagColor] || "k-accent-green"}`}>
                    {item.tag}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </article>
              ))
            )}
          </div>
          <div className="k-story-grid" style={{ marginTop: "1rem" }}>
            <div className="k-quote">
              "Sekarang saya merasa tidak sendiri saat menghadapi kondisi darurat."
            </div>
            <div className="k-panel">
              <strong style={{ display: "block", marginBottom: ".4rem" }}>Feed Instagram</strong>
              <div className="k-feed" style={{ marginTop: "1rem" }}>
                <div />
                <div />
                <div />
                <div />
                <div />
                <div />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
