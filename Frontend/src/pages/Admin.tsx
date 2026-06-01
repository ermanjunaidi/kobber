import { useState, useEffect, type ReactNode } from "react"
import { useNavigate } from "react-router"
import { api, type Stats, type NewsItem, type Member, type Donation, type ContactSubmission, type Campaign } from "@/lib/api"
import { formatRp } from "@/lib/utils"
import { useAuth } from "@/lib/auth"

interface AdminOverview {
  totalNews: number
  totalMembers: number
  totalDonations: number
  totalDonationRp: number
  totalContacts: number
  campaignProgress: {
    collected: number
    target: number
    percentage: number
  }
}

type Tab = "overview" | "news" | "members" | "donations" | "contacts" | "campaign" | "stats"

const DEFAULT_FORM = { title: "", summary: "", tag: "", tagColor: "green" }
const DEFAULT_MEMBER = { name: "", category: "", contribution: "" }

export default function Admin() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [contacts, setContacts] = useState<ContactSubmission[]>([])
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal / form state
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newsForm, setNewsForm] = useState(DEFAULT_FORM)
  const [memberForm, setMemberForm] = useState(DEFAULT_MEMBER)
  const [saving, setSaving] = useState(false)

  async function loadAll() {
    setLoading(true)
    setError(null)
    try {
      const [ov, n, m, d, c, s] = await Promise.all([
        api.admin.stats(),
        api.news.list(),
        api.members.list(),
        api.donations.list(),
        api.contact.list(),
        api.stats().catch(() => null),
      ])
      setOverview(ov)
      setNews(n)
      setMembers(m)
      setDonations(d)
      setContacts(c)
      setStats(s)
      // Get campaign
      try { setCampaign(await api.campaign()) } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  // --- News CRUD ---
  function openNewsModal(mode: "add" | "edit", item?: NewsItem) {
    setModalMode(mode)
    if (mode === "edit" && item) {
      setNewsForm({ title: item.title, summary: item.summary, tag: item.tag, tagColor: item.tagColor })
      setEditingId(item.id)
    } else {
      setNewsForm(DEFAULT_FORM)
      setEditingId(null)
    }
    setShowModal(true)
  }

  async function saveNews(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (modalMode === "add") {
        await api.news.create(newsForm)
      } else if (editingId !== null) {
        await api.news.update(editingId, newsForm)
      }
      setShowModal(false)
      await loadAll()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  async function deleteNews(id: number) {
    if (!confirm("Hapus berita ini?")) return
    try { await api.news.delete(id); await loadAll() } catch (e) { alert("Gagal menghapus") }
  }

  // --- Members CRUD ---
  function openMemberModal(mode: "add" | "edit", item?: Member) {
    setModalMode(mode)
    if (mode === "edit" && item) {
      setMemberForm({ name: item.name, category: item.category, contribution: item.contribution })
      setEditingId(item.id)
    } else {
      setMemberForm(DEFAULT_MEMBER)
      setEditingId(null)
    }
    setShowModal(true)
  }

  async function saveMember(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (modalMode === "add") {
        await api.members.create(memberForm)
      } else if (editingId !== null) {
        await api.members.update(editingId, memberForm)
      }
      setShowModal(false)
      await loadAll()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  async function deleteMember(id: number) {
    if (!confirm("Hapus anggota ini?")) return
    try { await api.members.delete(id); await loadAll() } catch (e) { alert("Gagal menghapus") }
  }

  const tabLabels: Record<Tab, string> = {
    overview: "Ringkasan",
    news: "Berita",
    members: "Anggota",
    donations: "Donasi",
    contacts: "Kontak",
    campaign: "Kampanye",
    stats: "Statistik",
  }

  if (loading) {
    return (
      <div className="k-page" style={{ padding: "3rem 0" }}>
        <div className="k-container">
          <p className="k-text-muted">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="k-page" style={{ padding: "3rem 0" }}>
        <div className="k-container">
          <p style={{ color: "var(--k-danger)" }}>{error}</p>
          <button className="k-btn k-btn-primary" onClick={loadAll}>Coba lagi</button>
        </div>
      </div>
    )
  }

  return (
    <div className="k-page" style={{ padding: "2rem 0" }}>
      <div className="k-container">
        {/* Header */}
        <div className="k-flex k-items-center k-justify-between k-flex-wrap" style={{ marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
            <p className="k-text-muted" style={{ marginTop: ".25rem" }}>Kelola semua konten KOBBER</p>
          </div>
          <div className="k-flex k-gap-3">
            <button className="k-btn k-btn-ghost" onClick={loadAll} style={{ fontSize: ".85rem" }}>
              ↻ Refresh
            </button>
            <button
              className="k-btn k-btn-ghost"
              onClick={() => { logout(); navigate("/admin/login") }}
              style={{ fontSize: ".85rem", color: "var(--k-danger)" }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="k-flex k-flex-wrap k-gap-3" style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--k-border)", paddingBottom: ".75rem" }}>
          {(Object.keys(tabLabels) as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`k-btn ${activeTab === tab ? "k-btn-primary" : "k-btn-ghost"}`}
              style={{ fontSize: ".85rem", padding: ".5rem 1rem" }}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && overview && <OverviewTab overview={overview} donations={donations} contacts={contacts} news={news} members={members} />}
        {activeTab === "news" && (
          <DataTableTab
            title="Berita"
            onAdd={() => openNewsModal("add")}
            columns={["ID", "Judul", "Ringkasan", "Tag", "Tanggal", "Aksi"]}
            renderRow={(n: NewsItem) => (
              <tr key={n.id}>
                <td className="k-text-muted k-tiny">{n.id}</td>
                <td><strong>{n.title}</strong></td>
                <td><span className="k-text-muted" style={{ fontSize: ".85rem" }}>{n.summary.slice(0, 60)}...</span></td>
                <td><span className="k-tag" style={{ fontSize: ".75rem" }}>{n.tag}</span></td>
                <td className="k-tiny k-text-muted">{new Date(n.publishedAt).toLocaleDateString("id-ID")}</td>
                <td>
                  <div className="k-flex k-gap-3">
                    <button className="k-btn k-btn-ghost" style={{ padding: ".3rem .6rem", fontSize: ".8rem" }} onClick={() => openNewsModal("edit", n)}>Edit</button>
                    <button className="k-btn k-btn-ghost" style={{ padding: ".3rem .6rem", fontSize: ".8rem", color: "var(--k-danger)" }} onClick={() => deleteNews(n.id)}>Hapus</button>
                  </div>
                </td>
              </tr>
            )}
            data={news}
          />
        )}
        {activeTab === "members" && (
          <DataTableTab
            title="Anggota"
            onAdd={() => openMemberModal("add")}
            columns={["ID", "Nama", "Kategori", "Kontribusi", "Aksi"]}
            renderRow={(m: Member) => (
              <tr key={m.id}>
                <td className="k-text-muted k-tiny">{m.id}</td>
                <td><strong>{m.name}</strong></td>
                <td><span className="k-tag" style={{ fontSize: ".75rem" }}>{m.category}</span></td>
                <td className="k-text-muted" style={{ fontSize: ".85rem" }}>{m.contribution}</td>
                <td>
                  <div className="k-flex k-gap-3">
                    <button className="k-btn k-btn-ghost" style={{ padding: ".3rem .6rem", fontSize: ".8rem" }} onClick={() => openMemberModal("edit", m)}>Edit</button>
                    <button className="k-btn k-btn-ghost" style={{ padding: ".3rem .6rem", fontSize: ".8rem", color: "var(--k-danger)" }} onClick={() => deleteMember(m.id)}>Hapus</button>
                  </div>
                </td>
              </tr>
            )}
            data={members}
          />
        )}
        {activeTab === "donations" && (
          <DataTableTab
            title="Donasi"
            columns={["ID", "Jumlah", "Program", "Donatur", "Tipe", "Tanggal"]}
            renderRow={(d: Donation) => (
              <tr key={d.id}>
                <td className="k-text-muted k-tiny">{d.id}</td>
                <td><strong>{formatRp(d.amount)}</strong></td>
                <td style={{ fontSize: ".85rem" }}>{d.program}</td>
                <td style={{ fontSize: ".85rem" }}>{d.donorName}{d.email ? ` (${d.email})` : ""}</td>
                <td><span className="k-tag" style={{ fontSize: ".75rem" }}>{d.type === "monthly" ? "Bulanan" : "Sekali"}</span></td>
                <td className="k-tiny k-text-muted">{new Date(d.createdAt).toLocaleDateString("id-ID")}</td>
              </tr>
            )}
            data={donations}
          />
        )}
        {activeTab === "contacts" && (
          <DataTableTab
            title="Kontak Masuk"
            columns={["ID", "Nama", "Kategori", "Kontak", "Minat", "Pesan", "Tanggal"]}
            renderRow={(c: ContactSubmission) => (
              <tr key={c.id}>
                <td className="k-text-muted k-tiny">{c.id}</td>
                <td><strong>{c.name}</strong></td>
                <td><span className="k-tag" style={{ fontSize: ".75rem" }}>{c.category}</span></td>
                <td style={{ fontSize: ".85rem" }}>{c.contact}</td>
                <td style={{ fontSize: ".85rem" }}>{c.interest || "-"}</td>
                <td style={{ fontSize: ".85rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{c.message || "-"}</td>
                <td className="k-tiny k-text-muted">{new Date(c.submittedAt).toLocaleDateString("id-ID")}</td>
              </tr>
            )}
            data={contacts}
          />
        )}
        {activeTab === "campaign" && campaign && <CampaignTab campaign={campaign} stats={stats} />}
        {activeTab === "stats" && stats && <StatsTab stats={stats} overview={overview!} />}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          display: "grid", placeItems: "center",
          background: "rgba(0,0,0,.45)",
          padding: "1rem",
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: "var(--k-surface)",
            border: "1px solid var(--k-border)",
            borderRadius: "24px",
            padding: "2rem",
            width: "min(540px, 100%)",
            maxHeight: "90vh",
            overflow: "auto",
          }} onClick={(e) => e.stopPropagation()}>
            <div className="k-flex k-items-center k-justify-between" style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ margin: 0 }}>{modalMode === "add" ? "Tambah" : "Edit"} {activeTab === "news" ? "Berita" : "Anggota"}</h2>
              <button className="k-btn k-btn-ghost" style={{ padding: ".3rem .6rem", fontSize: ".8rem" }} onClick={() => setShowModal(false)}>✕</button>
            </div>

            {activeTab === "news" ? (
              <form onSubmit={saveNews}>
                <div style={{ display: "grid", gap: ".85rem" }}>
                  <div>
                    <label className="k-tiny k-text-muted" style={{ display: "block", marginBottom: ".3rem", fontWeight: 700 }}>Judul</label>
                    <input value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} required
                      style={{ width: "100%", padding: ".6rem .8rem", borderRadius: ".5rem", border: "1px solid var(--k-border)", background: "transparent", color: "inherit", fontSize: "1rem" }} />
                  </div>
                  <div>
                    <label className="k-tiny k-text-muted" style={{ display: "block", marginBottom: ".3rem", fontWeight: 700 }}>Ringkasan</label>
                    <textarea value={newsForm.summary} onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })} rows={3}
                      style={{ width: "100%", padding: ".6rem .8rem", borderRadius: ".5rem", border: "1px solid var(--k-border)", background: "transparent", color: "inherit", fontSize: "1rem", resize: "vertical" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
                    <div>
                      <label className="k-tiny k-text-muted" style={{ display: "block", marginBottom: ".3rem", fontWeight: 700 }}>Tag</label>
                      <input value={newsForm.tag} onChange={(e) => setNewsForm({ ...newsForm, tag: e.target.value })}
                        style={{ width: "100%", padding: ".6rem .8rem", borderRadius: ".5rem", border: "1px solid var(--k-border)", background: "transparent", color: "inherit", fontSize: "1rem" }} />
                    </div>
                    <div>
                      <label className="k-tiny k-text-muted" style={{ display: "block", marginBottom: ".3rem", fontWeight: 700 }}>Warna Tag</label>
                      <select value={newsForm.tagColor} onChange={(e) => setNewsForm({ ...newsForm, tagColor: e.target.value })}
                        style={{ width: "100%", padding: ".6rem .8rem", borderRadius: ".5rem", border: "1px solid var(--k-border)", background: "transparent", color: "inherit", fontSize: "1rem" }}>
                        <option value="green">Hijau</option>
                        <option value="blue">Biru</option>
                        <option value="gold">Emas</option>
                        <option value="purple">Ungu</option>
                        <option value="danger">Merah</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="k-btn k-btn-primary" disabled={saving} style={{ marginTop: ".5rem" }}>
                    {saving ? "Menyimpan..." : modalMode === "add" ? "Tambah Berita" : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={saveMember}>
                <div style={{ display: "grid", gap: ".85rem" }}>
                  <div>
                    <label className="k-tiny k-text-muted" style={{ display: "block", marginBottom: ".3rem", fontWeight: 700 }}>Nama</label>
                    <input value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} required
                      style={{ width: "100%", padding: ".6rem .8rem", borderRadius: ".5rem", border: "1px solid var(--k-border)", background: "transparent", color: "inherit", fontSize: "1rem" }} />
                  </div>
                  <div>
                    <label className="k-tiny k-text-muted" style={{ display: "block", marginBottom: ".3rem", fontWeight: 700 }}>Kategori</label>
                    <select value={memberForm.category} onChange={(e) => setMemberForm({ ...memberForm, category: e.target.value })} required
                      style={{ width: "100%", padding: ".6rem .8rem", borderRadius: ".5rem", border: "1px solid var(--k-border)", background: "transparent", color: "inherit", fontSize: "1rem" }}>
                      <option value="">Pilih kategori</option>
                      <option value="RS">RS</option>
                      <option value="Universitas">Universitas</option>
                      <option value="NGO">NGO</option>
                      <option value="Perusahaan">Perusahaan</option>
                      <option value="Ormas">Ormas</option>
                    </select>
                  </div>
                  <div>
                    <label className="k-tiny k-text-muted" style={{ display: "block", marginBottom: ".3rem", fontWeight: 700 }}>Kontribusi</label>
                    <input value={memberForm.contribution} onChange={(e) => setMemberForm({ ...memberForm, contribution: e.target.value })}
                      style={{ width: "100%", padding: ".6rem .8rem", borderRadius: ".5rem", border: "1px solid var(--k-border)", background: "transparent", color: "inherit", fontSize: "1rem" }} />
                  </div>
                  <button type="submit" className="k-btn k-btn-primary" disabled={saving} style={{ marginTop: ".5rem" }}>
                    {saving ? "Menyimpan..." : modalMode === "add" ? "Tambah Anggota" : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// --- Sub-components ---

function OverviewTab({ overview, donations, contacts, news, members }: {
  overview: AdminOverview
  donations: Donation[]
  contacts: ContactSubmission[]
  news: NewsItem[]
  members: Member[]
}) {
  const totalDonationRp = donations.reduce((s, d) => s + d.amount, 0)
  const monthlyDonations = donations.filter(d => d.type === "monthly").reduce((s, d) => s + d.amount, 0)
  const newContacts = contacts.filter(c => new Date(c.submittedAt) > new Date(Date.now() - 7 * 86400000)).length

  return (
    <div>
      <div className="k-grid-4" style={{ marginBottom: "1.5rem" }}>
        <div className="k-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--k-font-display)" }}>{news.length}</div>
          <span className="k-text-muted k-tiny">Total Berita</span>
        </div>
        <div className="k-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--k-font-display)" }}>{members.length}</div>
          <span className="k-text-muted k-tiny">Total Anggota</span>
        </div>
        <div className="k-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--k-font-display)" }}>{formatRp(totalDonationRp)}</div>
          <span className="k-text-muted k-tiny">Total Donasi ({donations.length} transaksi)</span>
        </div>
        <div className="k-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--k-font-display)" }}>{contacts.length}</div>
          <span className="k-text-muted k-tiny">Kontak Masuk{newContacts > 0 ? ` (${newContacts} baru minggu ini)` : ""}</span>
        </div>
      </div>

      <div className="k-grid-2" style={{ marginBottom: "1.5rem" }}>
        <div className="k-panel">
          <h3>Progress Kampanye</h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: ".75rem" }}>
            <span><strong>{formatRp(overview.campaignProgress.collected)}</strong></span>
            <span className="k-text-muted">dari {formatRp(overview.campaignProgress.target)}</span>
          </div>
          <div className="k-kpi-bar">
            <i style={{ width: `${overview.campaignProgress.percentage}%` }} />
          </div>
          <div style={{ marginTop: ".5rem" }}>
            <span className="k-accent-green k-tag">{Math.round(overview.campaignProgress.percentage)}% tercapai</span>
          </div>
        </div>
        <div className="k-panel">
          <h3>Donasi Bulanan</h3>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--k-font-display)", marginTop: ".5rem" }}>{formatRp(monthlyDonations)}</div>
          <p className="k-text-muted">Total dari donasi rutin bulanan</p>
          <div className="k-kpi-bar">
            <i style={{ width: `${donations.length > 0 ? (monthlyDonations / totalDonationRp) * 100 : 0}%`, background: "var(--k-gold)" }} />
          </div>
        </div>
      </div>

      <div className="k-grid-3">
        <div className="k-panel">
          <h3>Berita Terbaru</h3>
          {news.slice(0, 4).map(n => (
            <div key={n.id} style={{ padding: ".5rem 0", borderBottom: "1px solid var(--k-border)" }}>
              <div style={{ fontWeight: 600, fontSize: ".9rem" }}>{n.title}</div>
              <div className="k-tiny k-text-muted">{new Date(n.publishedAt).toLocaleDateString("id-ID")}</div>
            </div>
          ))}
        </div>
        <div className="k-panel">
          <h3>Anggota Terbaru</h3>
          {members.slice(0, 4).map(m => (
            <div key={m.id} style={{ padding: ".5rem 0", borderBottom: "1px solid var(--k-border)" }}>
              <div style={{ fontWeight: 600, fontSize: ".9rem" }}>{m.name}</div>
              <span className="k-tag k-tiny">{m.category}</span>
            </div>
          ))}
        </div>
        <div className="k-panel">
          <h3>Kontak Terbaru</h3>
          {contacts.slice(0, 4).map(c => (
            <div key={c.id} style={{ padding: ".5rem 0", borderBottom: "1px solid var(--k-border)" }}>
              <div style={{ fontWeight: 600, fontSize: ".9rem" }}>{c.name}</div>
              <div className="k-tiny k-text-muted">{c.category} • {c.contact}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DataTableTab<T extends { id: number }>({ title, onAdd, columns, renderRow, data }: {
  title: string
  onAdd?: () => void
  columns: string[]
  renderRow: (item: T) => ReactNode
  data: T[]
}) {
  return (
    <div>
      <div className="k-flex k-items-center k-justify-between" style={{ marginBottom: "1rem" }}>
        <h3 style={{ margin: 0 }}>{title} ({data.length})</h3>
        {onAdd && (
          <button className="k-btn k-btn-primary" onClick={onAdd} style={{ fontSize: ".85rem", padding: ".5rem 1rem" }}>
            + Tambah
          </button>
        )}
      </div>
      <div style={{ overflowX: "auto", border: "1px solid var(--k-border)", borderRadius: "16px", background: "var(--k-surface)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".9rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--k-border)" }}>
              {columns.map(col => <th key={col} style={{ textAlign: "left", padding: ".75rem 1rem", fontWeight: 700, fontSize: ".8rem", textTransform: "uppercase", color: "var(--k-text-muted)" }}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ padding: "2rem", textAlign: "center", color: "var(--k-text-muted)" }}>Belum ada data</td></tr>
            ) : (
              data.map(item => renderRow(item))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CampaignTab({ campaign, stats }: { campaign: Campaign; stats: Stats | null }) {
  return (
    <div className="k-grid-2">
      <div className="k-panel k-panel-accent-gold">
        <h2>Kampanye Aktif</h2>
        <h3 style={{ marginTop: ".75rem" }}>{campaign.title}</h3>
        <p>{campaign.description}</p>
        <div style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span><strong>{formatRp(campaign.collected)}</strong></span>
            <span className="k-text-muted">Target: {formatRp(campaign.target)}</span>
          </div>
          <div className="k-kpi-bar" style={{ marginTop: ".5rem" }}>
            <i style={{ width: `${campaign.percentage}%`, background: "linear-gradient(90deg, var(--k-gold), var(--k-primary))" }} />
          </div>
          <div style={{ textAlign: "right", marginTop: ".35rem", fontWeight: 700, fontSize: "1.1rem" }}>
            {Math.round(campaign.percentage)}%
          </div>
        </div>
      </div>
      <div className="k-panel">
        <h2>Statistik Terkait</h2>
        {stats && (
          <div style={{ display: "grid", gap: ".75rem", marginTop: ".75rem" }}>
            <div className="k-flex k-items-center k-justify-between">
              <span className="k-text-muted">Lembaga Kolaborasi</span>
              <strong>{stats.organizations}+</strong>
            </div>
            <div className="k-flex k-items-center k-justify-between">
              <span className="k-text-muted">Penerima Manfaat</span>
              <strong>{stats.beneficiaries.toLocaleString("id-ID")}</strong>
            </div>
            <div className="k-flex k-items-center k-justify-between">
              <span className="k-text-muted">Dukungan Terpetakan</span>
              <strong>{formatRp(stats.fundingRp)}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatsTab({ stats, overview }: { stats: Stats; overview: AdminOverview }) {
  return (
    <div>
      <div className="k-grid-3" style={{ marginBottom: "1.5rem" }}>
        <div className="k-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "var(--k-font-display)" }}>{stats.organizations}+</div>
          <span className="k-text-muted">Lembaga Kolaborasi</span>
        </div>
        <div className="k-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "var(--k-font-display)" }}>{stats.beneficiaries.toLocaleString("id-ID")}</div>
          <span className="k-text-muted">Penerima Manfaat</span>
        </div>
        <div className="k-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "var(--k-font-display)" }}>{formatRp(stats.fundingRp)}</div>
          <span className="k-text-muted">Dukungan Terpetakan</span>
        </div>
      </div>

      <div className="k-panel">
        <h3>Database Summary</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: ".75rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--k-border)" }}>
              <th style={{ textAlign: "left", padding: ".6rem 1rem", fontWeight: 700, fontSize: ".8rem", textTransform: "uppercase", color: "var(--k-text-muted)" }}>Tabel</th>
              <th style={{ textAlign: "right", padding: ".6rem 1rem", fontWeight: 700, fontSize: ".8rem", textTransform: "uppercase", color: "var(--k-text-muted)" }}>Jumlah Record</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Berita (news_items)", count: overview.totalNews },
              { name: "Anggota (members)", count: overview.totalMembers },
              { name: "Donasi (donations)", count: overview.totalDonations },
              { name: "Kontak Masuk (contact_submissions)", count: overview.totalContacts },
              { name: "Kampanye (campaigns)", count: 1 },
              { name: "Statistik (stats)", count: 1 },
            ].map(row => (
              <tr key={row.name} style={{ borderBottom: "1px solid var(--k-border)" }}>
                <td style={{ padding: ".6rem 1rem" }}>{row.name}</td>
                <td style={{ padding: ".6rem 1rem", textAlign: "right", fontWeight: 700 }}>{row.count}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ padding: ".6rem 1rem", fontWeight: 700 }}>Total</td>
              <td style={{ padding: ".6rem 1rem", textAlign: "right", fontWeight: 800, fontSize: "1.1rem" }}>
                {overview.totalNews + overview.totalMembers + overview.totalDonations + overview.totalContacts + 2}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
