import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router"
import { api, ApiError, type Stats, type NewsItem, type Member, type Donation, type ContactSubmission, type Campaign } from "@/lib/api"
import { formatRp } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Heart,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Image,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  LogOut,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

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

const DEFAULT_NEWS_FORM = { title: "", summary: "", tag: "", tagColor: "green", imageUrl: "" }
const DEFAULT_MEMBER_FORM = { name: "", category: "", contribution: "" }

const sidebarItems: { tab: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { tab: "overview", label: "Ringkasan", icon: LayoutDashboard },
  { tab: "news", label: "Berita", icon: Newspaper },
  { tab: "members", label: "Anggota", icon: Users },
  { tab: "donations", label: "Donasi", icon: Heart },
  { tab: "contacts", label: "Kontak", icon: MessageSquare },
  { tab: "campaign", label: "Kampanye", icon: TrendingUp },
  { tab: "stats", label: "Statistik", icon: BarChart3 },
]

function AppSidebar({ activeTab, onTabChange }: {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}) {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-1">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-blue-700 font-bold text-white text-xs shadow-sm"
          >
            K
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold leading-tight">KOBBER</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Admin Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {sidebarItems.map((item) => (
              <SidebarMenuItem key={item.tab}>
                <SidebarMenuButton
                  isActive={activeTab === item.tab}
                  tooltip={item.label}
                  onClick={() => onTabChange(item.tab)}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="px-1 py-1">
          <p className="text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden px-2">
            KOBBER v1.0
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

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
  const [showNewsDialog, setShowNewsDialog] = useState(false)
  const [showMemberDialog, setShowMemberDialog] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newsForm, setNewsForm] = useState(DEFAULT_NEWS_FORM)
  const [memberForm, setMemberForm] = useState(DEFAULT_MEMBER_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      try { setCampaign(await api.campaign()) } catch {}
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        logout()
        navigate("/admin/login", { replace: true })
        return
      }
      setError(e instanceof Error ? e.message : "Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  // --- News CRUD ---
  function openNewsDialog(mode: "add" | "edit", item?: NewsItem) {
    setModalMode(mode)
    setPreviewImage(prev => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev)
      return null
    })
    setSelectedFile(null)
    if (mode === "edit" && item) {
      setNewsForm({ title: item.title, summary: item.summary, tag: item.tag, tagColor: item.tagColor, imageUrl: item.imageUrl || "" })
      setEditingId(item.id)
      if (item.imageUrl) setPreviewImage(item.imageUrl)
    } else {
      setNewsForm(DEFAULT_NEWS_FORM)
      setEditingId(null)
    }
    setShowNewsDialog(true)
  }

  async function saveNews(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (modalMode === "add") {
        const created = await api.news.create(newsForm)
        if (selectedFile) {
          await api.news.uploadImage(created.id, selectedFile)
        }
      } else if (editingId !== null) {
        await api.news.update(editingId, newsForm)
      }
      setShowNewsDialog(false)
      setSelectedFile(null)
      await loadAll()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      alert("Hanya file JPG, PNG, WebP, dan GIF yang diizinkan")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB")
      return
    }

    setUploading(true)
    try {
      if (modalMode === "add") {
        setSelectedFile(file)
        setPreviewImage(URL.createObjectURL(file))
      } else if (editingId !== null) {
        const result = await api.news.uploadImage(editingId, file)
        setNewsForm(prev => ({ ...prev, imageUrl: result.imageUrl }))
        setPreviewImage(result.imageUrl)
        await loadAll()
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal mengupload gambar")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function deleteNews(id: number) {
    if (!confirm("Hapus berita ini?")) return
    try { await api.news.delete(id); await loadAll() } catch (e) { alert("Gagal menghapus") }
  }

  // --- Members CRUD ---
  function openMemberDialog(mode: "add" | "edit", item?: Member) {
    setModalMode(mode)
    if (mode === "edit" && item) {
      setMemberForm({ name: item.name, category: item.category, contribution: item.contribution })
      setEditingId(item.id)
    } else {
      setMemberForm(DEFAULT_MEMBER_FORM)
      setEditingId(null)
    }
    setShowMemberDialog(true)
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
      setShowMemberDialog(false)
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-sm mb-3">{error}</p>
          <Button variant="ghost" size="sm" onClick={loadAll}>
            <RefreshCw /> Coba lagi
          </Button>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            {/* Top bar */}
            <header className="flex h-12 items-center justify-between gap-3 border-b bg-background px-4 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <div>
                  <h2 className="text-sm font-semibold leading-tight">{tabLabels[activeTab]}</h2>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={loadAll}>
                  <RefreshCw className="size-3.5" /> Refresh
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { logout(); navigate("/admin/login") }}
                  className="text-destructive hover:text-destructive"
                >
                  <LogOut className="size-3.5" /> Logout
                </Button>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-4 lg:p-6">
              {activeTab === "overview" && overview && <OverviewTab overview={overview} donations={donations} contacts={contacts} news={news} members={members} />}
              {activeTab === "news" && (
                <NewsTab
                  news={news}
                  onAdd={() => openNewsDialog("add")}
                  onEdit={(item) => openNewsDialog("edit", item)}
                  onDelete={deleteNews}
                />
              )}
              {activeTab === "members" && (
                <MembersTab
                  members={members}
                  onAdd={() => openMemberDialog("add")}
                  onEdit={(item) => openMemberDialog("edit", item)}
                  onDelete={deleteMember}
                />
              )}
              {activeTab === "donations" && <DonationsTab donations={donations} />}
              {activeTab === "contacts" && <ContactsTab contacts={contacts} />}
              {activeTab === "campaign" && campaign && <CampaignTab campaign={campaign} stats={stats} />}
              {activeTab === "stats" && stats && overview && <StatsTab stats={stats} overview={overview} />}
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* News Dialog */}
      <Dialog open={showNewsDialog} onOpenChange={setShowNewsDialog}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalMode === "add" ? "Tambah Berita" : "Edit Berita"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveNews} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Judul</label>
              <Input
                value={newsForm.title}
                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                required
                placeholder="Judul berita"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Ringkasan</label>
              <Textarea
                value={newsForm.summary}
                onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                rows={3}
                placeholder="Ringkasan berita"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Tag</label>
                <Input
                  value={newsForm.tag}
                  onChange={(e) => setNewsForm({ ...newsForm, tag: e.target.value })}
                  placeholder="Berita terbaru"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Warna Tag</label>
                <Select value={newsForm.tagColor} onValueChange={(v) => setNewsForm({ ...newsForm, tagColor: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">Hijau</SelectItem>
                    <SelectItem value="blue">Biru</SelectItem>
                    <SelectItem value="gold">Emas</SelectItem>
                    <SelectItem value="purple">Ungu</SelectItem>
                    <SelectItem value="danger">Merah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Gambar</label>
              {previewImage && (
                <div className="relative rounded-lg overflow-hidden border border-border mb-2">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                    onClick={() => {
                      setPreviewImage(prev => {
                        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev)
                        return null
                      })
                      setSelectedFile(null)
                      setNewsForm(prev => ({ ...prev, imageUrl: "" }))
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}
              {!previewImage && (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto size-6 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">
                    {modalMode === "add"
                      ? "Klik untuk pilih gambar"
                      : "Klik untuk upload gambar"}
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {!previewImage && (
                <p className="text-xs text-muted-foreground">
                  {modalMode === "add" ? "Pilih gambar untuk diupload setelah berita tersimpan." : "Klik untuk upload gambar."}
                </p>
              )}
              {uploading && <p className="text-xs text-muted-foreground">Mengupload gambar...</p>}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : modalMode === "add" ? "Tambah Berita" : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Member Dialog */}
      <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modalMode === "add" ? "Tambah Anggota" : "Edit Anggota"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveMember} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nama</label>
              <Input
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                required
                placeholder="Nama lembaga/anggota"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Kategori</label>
              <Select value={memberForm.category} onValueChange={(v) => setMemberForm({ ...memberForm, category: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RS">RS</SelectItem>
                  <SelectItem value="Universitas">Universitas</SelectItem>
                  <SelectItem value="NGO">NGO</SelectItem>
                  <SelectItem value="Perusahaan">Perusahaan</SelectItem>
                  <SelectItem value="Ormas">Ormas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Kontribusi</label>
              <Input
                value={memberForm.contribution}
                onChange={(e) => setMemberForm({ ...memberForm, contribution: e.target.value })}
                placeholder="Bidang kontribusi"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : modalMode === "add" ? "Tambah Anggota" : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

// --- Overview Tab ---
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: "1.5rem" }}>
        {[
          { value: news.length, label: "Total Berita" },
          { value: members.length, label: "Total Anggota" },
          { value: formatRp(totalDonationRp), label: `Total Donasi (${donations.length} transaksi)` },
          { value: contacts.length, label: `Kontak Masuk${newContacts > 0 ? ` (${newContacts} baru)` : ""}` },
        ].map((item, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 text-center shadow-sm">
            <div style={{ fontSize: "clamp(1.4rem, 2vw, 2rem)", fontWeight: 800, fontFamily: "var(--k-font-display)" }}>{item.value}</div>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ marginBottom: "1.5rem" }}>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-base font-semibold mb-0">Progress Kampanye</h3>
          <div className="flex justify-between mt-3">
            <span><strong>{formatRp(overview.campaignProgress.collected)}</strong></span>
            <span className="text-muted-foreground text-sm">dari {formatRp(overview.campaignProgress.target)}</span>
          </div>
          <div className="k-kpi-bar">
            <i style={{ width: `${overview.campaignProgress.percentage}%` }} />
          </div>
          <div className="mt-2">
            <Badge variant="secondary">{Math.round(overview.campaignProgress.percentage)}% tercapai</Badge>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-base font-semibold mb-0">Donasi Bulanan</h3>
          <div style={{ fontSize: "clamp(1.4rem, 2vw, 1.8rem)", fontWeight: 800, fontFamily: "var(--k-font-display)", marginTop: ".5rem" }}>{formatRp(monthlyDonations)}</div>
          <p className="text-sm text-muted-foreground">Total dari donasi rutin bulanan</p>
          <div className="k-kpi-bar">
            <i style={{ width: `${donations.length > 0 ? (monthlyDonations / totalDonationRp) * 100 : 0}%`, background: "var(--k-gold)" }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Berita Terbaru", items: news.slice(0, 4).map(n => ({ primary: n.title, secondary: new Date(n.publishedAt).toLocaleDateString("id-ID") })) },
          { title: "Anggota Terbaru", items: members.slice(0, 4).map(m => ({ primary: m.name, secondary: m.category })) },
          { title: "Kontak Terbaru", items: contacts.slice(0, 4).map(c => ({ primary: c.name, secondary: `${c.category} • ${c.contact}` })) },
        ].map((section, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-base font-semibold mb-3">{section.title}</h3>
            {section.items.map((item, j) => (
              <div key={j} style={{ padding: ".5rem 0", borderBottom: "1px solid var(--k-border)" }}>
                <div style={{ fontWeight: 600, fontSize: ".9rem" }}>{item.primary}</div>
                <div className="text-xs text-muted-foreground">{item.secondary}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// --- News Tab ---
const NEWS_PER_PAGE = 10

const tagBadgeClass: Record<string, string> = {
  green: "k-accent-green",
  blue: "k-accent-blue",
  gold: "k-accent-gold",
  purple: "k-accent-purple",
  danger: "k-accent-danger",
}

function NewsTab({ news, onAdd, onEdit, onDelete }: {
  news: NewsItem[]
  onAdd: () => void
  onEdit: (item: NewsItem) => void
  onDelete: (id: number) => void
}) {
  const [page, setPage] = useState(1)
  const sorted = useMemo(() => [...news].sort((a, b) => b.id - a.id), [news])
  const totalPages = Math.max(1, Math.ceil(sorted.length / NEWS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * NEWS_PER_PAGE
  const endIndex = startIndex + NEWS_PER_PAGE
  const paginatedNews = sorted.slice(startIndex, endIndex)

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [news.length, totalPages, page])

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: "1rem" }}>
        <h3 style={{ margin: 0 }}>
          Berita 
          <span className="text-muted-foreground font-normal text-sm ml-1.5">({news.length})</span>
        </h3>
        <Button size="sm" onClick={onAdd}><Plus className="size-4" /> Tambah</Button>
      </div>
      <div className="rounded-xl border border-border bg-background overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-12 font-semibold">#</TableHead>
                <TableHead className="min-w-[220px] font-semibold">Judul</TableHead>
                <TableHead className="hidden md:table-cell min-w-[100px] font-semibold">Gambar</TableHead>
                <TableHead className="hidden lg:table-cell font-semibold">Ringkasan</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold">Tag</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold">Tanggal</TableHead>
                <TableHead className="w-24 text-right font-semibold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedNews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Image className="size-8 text-muted-foreground/40" />
                      <span>{news.length === 0 ? "Belum ada berita" : "Halaman ini kosong"}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedNews.map((item) => (
                  <TableRow
                    key={item.id}
                    className="group transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="text-muted-foreground/50 text-xs font-mono">
                      {item.id}
                    </TableCell>
                    <TableCell className="font-medium max-w-[280px]">
                      <div className="flex items-start gap-2.5">
                        <div className="md:hidden size-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="size-full object-cover" />
                          ) : (
                            <div className="size-full flex items-center justify-center">
                              <Image className="size-4 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-sm">{item.title}</div>
                          <div className="flex items-center gap-2 mt-1 md:hidden">
                            <span className={`k-tag ${tagBadgeClass[item.tagColor] || "k-accent-green"}`}>
                              {item.tag}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(item.publishedAt).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-14 h-10 rounded-lg object-cover border border-border ring-1 ring-black/5 transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-14 h-10 rounded-lg bg-muted flex items-center justify-center border border-border">
                          <Image className="size-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[240px]">
                      <span className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                        {item.summary || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className={`k-tag ${tagBadgeClass[item.tagColor] || "k-accent-green"}`}>
                        {item.tag}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="size-1 rounded-full bg-muted-foreground/30" />
                        {new Date(item.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button variant="ghost" size="icon-xs" onClick={() => onEdit(item)} title="Edit" className="hover:bg-blue-50 hover:text-blue-700">
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={() => onDelete(item.id)} title="Hapus" className="hover:bg-red-50 hover:text-red-700">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 mt-4">
          <span className="text-xs text-muted-foreground">
            {startIndex + 1}–{Math.min(endIndex, sorted.length)} dari {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="h-8"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Button
                key={p}
                variant={p === safePage ? "default" : "outline"}
                size="icon-xs"
                className={`min-w-[32px] h-8 ${p === safePage ? "shadow-sm" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="h-8"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Members Tab ---
function MembersTab({ members, onAdd, onEdit, onDelete }: {
  members: Member[]
  onAdd: () => void
  onEdit: (item: Member) => void
  onDelete: (id: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: "1rem" }}>
        <h3 style={{ margin: 0 }}>Anggota ({members.length})</h3>
        <Button size="sm" onClick={onAdd}><Plus /> Tambah</Button>
      </div>
      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead className="min-w-[180px]">Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="hidden md:table-cell">Kontribusi</TableHead>
                <TableHead className="w-24 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Belum ada anggota
                  </TableCell>
                </TableRow>
              ) : (
                members.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground text-xs font-mono">{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{item.contribution}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-xs" onClick={() => onEdit(item)} title="Edit">
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={() => onDelete(item.id)} title="Hapus" className="text-destructive hover:text-destructive">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

// --- Donations Tab ---
function DonationsTab({ donations }: { donations: Donation[] }) {
  return (
    <div>
      <h3 style={{ marginBottom: "1rem" }}>Donasi ({donations.length})</h3>
      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Program</TableHead>
                <TableHead className="hidden sm:table-cell">Donatur</TableHead>
                <TableHead className="hidden sm:table-cell">Tipe</TableHead>
                <TableHead className="hidden md:table-cell">Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Belum ada donasi
                  </TableCell>
                </TableRow>
              ) : (
                donations.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-muted-foreground text-xs font-mono">{d.id}</TableCell>
                    <TableCell className="font-medium">{formatRp(d.amount)}</TableCell>
                    <TableCell className="text-sm">{d.program}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{d.donorName}{d.email ? ` (${d.email})` : ""}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={d.type === "monthly" ? "default" : "secondary"}>
                        {d.type === "monthly" ? "Bulanan" : "Sekali"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {new Date(d.createdAt).toLocaleDateString("id-ID")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

// --- Contacts Tab ---
function ContactsTab({ contacts }: { contacts: ContactSubmission[] }) {
  return (
    <div>
      <h3 style={{ marginBottom: "1rem" }}>Kontak Masuk ({contacts.length})</h3>
      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead className="hidden sm:table-cell">Kategori</TableHead>
                <TableHead className="hidden sm:table-cell">Kontak</TableHead>
                <TableHead className="hidden md:table-cell">Pesan</TableHead>
                <TableHead className="hidden md:table-cell">Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Belum ada kontak masuk
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-muted-foreground text-xs font-mono">{c.id}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="hidden sm:table-cell"><Badge variant="secondary">{c.category}</Badge></TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{c.contact}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-[200px]">
                      <span className="line-clamp-2">{c.message || "-"}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {new Date(c.submittedAt).toLocaleDateString("id-ID")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

// --- Campaign Tab ---
function CampaignTab({ campaign, stats }: { campaign: Campaign; stats: Stats | null }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm" style={{ background: "var(--k-gold-bg)" }}>
        <h2 className="text-lg font-bold">Kampanye Aktif</h2>
        <h3 style={{ marginTop: ".75rem" }}>{campaign.title}</h3>
        <p>{campaign.description}</p>
        <div style={{ marginTop: "1rem" }}>
          <div className="flex justify-between">
            <span><strong>{formatRp(campaign.collected)}</strong></span>
            <span className="text-muted-foreground text-sm">Target: {formatRp(campaign.target)}</span>
          </div>
          <div className="k-kpi-bar" style={{ marginTop: ".5rem" }}>
            <i style={{ width: `${campaign.percentage}%`, background: "linear-gradient(90deg, var(--k-gold), var(--k-primary))" }} />
          </div>
          <div style={{ textAlign: "right", marginTop: ".35rem", fontWeight: 700, fontSize: "1.1rem" }}>
            {Math.round(campaign.percentage)}%
          </div>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Statistik Terkait</h2>
        {stats && (
          <div style={{ display: "grid", gap: ".75rem", marginTop: ".75rem" }}>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Lembaga Kolaborasi</span>
              <strong>{stats.organizations}+</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Penerima Manfaat</span>
              <strong>{stats.beneficiaries.toLocaleString("id-ID")}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Dukungan Terpetakan</span>
              <strong>{formatRp(stats.fundingRp)}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Stats Tab ---
function StatsTab({ stats, overview }: { stats: Stats; overview: AdminOverview }) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginBottom: "1.5rem" }}>
        {[
          { value: `${stats.organizations}+`, label: "Lembaga Kolaborasi" },
          { value: stats.beneficiaries.toLocaleString("id-ID"), label: "Penerima Manfaat" },
          { value: formatRp(stats.fundingRp), label: "Dukungan Terpetakan" },
        ].map((item, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 text-center shadow-sm">
            <div style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.5rem)", fontWeight: 800, fontFamily: "var(--k-font-display)" }}>{item.value}</div>
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold mb-3">Database Summary</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tabel</TableHead>
                <TableHead className="text-right">Jumlah Record</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: "Berita (news_items)", count: overview.totalNews },
                { name: "Anggota (members)", count: overview.totalMembers },
                { name: "Donasi (donations)", count: overview.totalDonations },
                { name: "Kontak Masuk (contact_submissions)", count: overview.totalContacts },
                { name: "Kampanye (campaigns)", count: 1 },
                { name: "Statistik (stats)", count: 1 },
              ].map(row => (
                <TableRow key={row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell className="text-right font-medium">{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
