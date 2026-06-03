import { useState, useEffect } from "react"
import { api, type Campaign, type Donation } from "@/lib/api"
import { formatRp } from "@/lib/utils"

export default function Donasi() {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [amount, setAmount] = useState(50000)
  const [customAmount, setCustomAmount] = useState("")
  const [program, setProgram] = useState("")
  const [donorName, setDonorName] = useState("")
  const [email, setEmail] = useState("")
  const [donationType, setDonationType] = useState<"once" | "monthly">("once")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [campaignData, donationData] = await Promise.all([
          api.campaign(),
          api.donations.list(),
        ])
        setCampaign(campaignData)
        setDonations(donationData)
      } catch (e) {
        console.error("Failed to load donation data:", e)
      }
    }
    load()
  }, [])

  const presetAmounts = [25000, 50000, 100000, 250000, 500000]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const finalAmount = amount > 0 ? amount : Number.parseInt(customAmount, 10)
      if (!finalAmount || finalAmount <= 0) {
        setMessage({ type: "error", text: "Masukkan jumlah donasi yang valid" })
        setSubmitting(false)
        return
      }
      await api.donations.create({
        amount: finalAmount,
        program,
        donorName: donorName || undefined,
        email: email || undefined,
        type: donationType,
      })
      setMessage({ type: "success", text: "Donasi berhasil dikirim! Terima kasih atas partisipasi Anda." })
      // Refresh data
      const [campaignData, donationData] = await Promise.all([
        api.campaign(),
        api.donations.list(),
      ])
      setCampaign(campaignData)
      setDonations(donationData)
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Gagal mengirim donasi" })
    } finally {
      setSubmitting(false)
    }
  }

  const totalCollected = donations.reduce((sum, d) => sum + d.amount, 0)
  const totalUsed = Math.round(totalCollected * 0.68) // ~68% penggunaan

  return (
    <div className="k-page">
      <section className="k-subhero">
        <div className="k-container">
          <div className="k-subhero-box">
            <span className="k-eyebrow">Mesin fundraising</span>
            <h1>Donasi untuk Ibu dan Anak Brebes</h1>
            <p>Setiap elemen halaman ini dirancang untuk menurunkan hambatan, memperjelas dampak, dan mengubah pengunjung menjadi donatur.</p>
          </div>
        </div>
      </section>

      <section className="k-section">
        <div className="k-container k-donation-grid">
          <div className="k-panel">
            <h2>Form donasi</h2>
            {message && (
              <div style={{
                padding: ".75rem",
                borderRadius: ".5rem",
                marginTop: ".75rem",
                background: message.type === "success" ? "var(--k-green-light, #d4edda)" : "var(--k-red-light, #f8d7da)",
                color: message.type === "success" ? "var(--k-green, #155724)" : "var(--k-red, #721c24)",
              }}>
                {message.text}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="k-amounts" style={{ marginTop: "1rem" }}>
                {presetAmounts.map((preset) => (
                  <div
                    key={preset}
                    className={`k-amount ${amount === preset && customAmount === "" ? "active" : ""}`}
                    onClick={() => { setAmount(preset); setCustomAmount("") }}
                  >
                    {formatRp(preset)}
                  </div>
                ))}
                <div
                  className={`k-amount ${customAmount !== "" ? "active" : ""}`}
                  onClick={() => setAmount(0)}
                >
                  Isi sendiri
                </div>
              </div>
              {amount === 0 && (
                <input
                  type="number"
                  placeholder="Masukkan nominal"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: ".75rem",
                    padding: ".6rem .8rem",
                    borderRadius: ".5rem",
                    border: "1px solid var(--k-border)",
                    background: "transparent",
                    color: "inherit",
                    fontSize: "1rem",
                  }}
                />
              )}
              <div className="k-form-mock" style={{ marginTop: "1rem" }}>
                <input
                  type="text"
                  placeholder="Nama program (misal: USG ibu hamil)"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  style={{
                    width: "100%",
                    padding: ".6rem .8rem",
                    borderRadius: ".5rem",
                    border: "1px solid var(--k-border)",
                    background: "transparent",
                    color: "inherit",
                    fontSize: "1rem",
                    marginBottom: ".75rem",
                  }}
                />

                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".75rem" }}>
                  <button
                    type="button"
                    className={`k-btn ${donationType === "once" ? "k-btn-primary" : "k-btn-ghost"}`}
                    onClick={() => setDonationType("once")}
                    style={{ flex: 1, fontSize: ".85rem", padding: ".4rem .6rem" }}
                  >
                    Sekali
                  </button>
                  <button
                    type="button"
                    className={`k-btn ${donationType === "monthly" ? "k-btn-primary" : "k-btn-ghost"}`}
                    onClick={() => setDonationType("monthly")}
                    style={{ flex: 1, fontSize: ".85rem", padding: ".4rem .6rem" }}
                  >
                    Bulanan
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Nama (opsional)"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: ".6rem .8rem",
                    borderRadius: ".5rem",
                    border: "1px solid var(--k-border)",
                    background: "transparent",
                    color: "inherit",
                    fontSize: "1rem",
                    marginBottom: ".75rem",
                  }}
                />
                <input
                  type="email"
                  placeholder="Email (opsional untuk laporan)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: ".6rem .8rem",
                    borderRadius: ".5rem",
                    border: "1px solid var(--k-border)",
                    background: "transparent",
                    color: "inherit",
                    fontSize: "1rem",
                    marginBottom: ".75rem",
                  }}
                />
                <button
                  type="submit"
                  className="k-btn k-btn-secondary"
                  disabled={submitting}
                  style={{ width: "100%" }}
                >
                  {submitting ? "Memproses..." : "Donasi sekarang"}
                </button>
              </div>
            </form>
          </div>
          <div className="k-panel k-panel-accent-gold">
            <h2>Progress kampanye</h2>
            <p>{campaign ? campaign.description : "Embed progress Kitabisa dan cerita lapangan singkat."}</p>
            <div className="k-kpi-bar">
              <i style={{ width: `${campaign ? campaign.percentage : 74}%`, background: "linear-gradient(90deg, var(--k-gold), var(--k-primary))" }} />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: ".75rem",
                fontWeight: 700,
              }}
            >
              <span>{campaign ? formatRp(campaign.collected) : "Rp 74.000.000"}</span>
              <span>dari target {campaign ? formatRp(campaign.target) : "Rp 100.000.000"}</span>
            </div>
            <div className="k-quote" style={{ marginTop: "1rem", borderLeftColor: "var(--k-gold)" }}>
              "Donasi Anda membantu pemeriksaan ibu hamil berisiko tinggi dan transport rujukan darurat."
            </div>
          </div>
        </div>
      </section>

      <section className="k-section k-section-alt">
        <div className="k-container k-grid-3">
          <div className="k-card">
            <span className="k-tag k-accent-green">Dampak per pilihan</span>
            <h3>USG ibu hamil</h3>
            <p>Kartu manfaat spesifik agar nominal terasa nyata.</p>
          </div>
          <div className="k-card">
            <span className="k-tag k-accent-blue">Paket gizi balita</span>
            <h3>Dukungan 1 anak</h3>
            <p>Membantu kebutuhan gizi awal.</p>
          </div>
          <div className="k-card">
            <span className="k-tag k-accent-danger">Persalinan darurat</span>
            <h3>Respon cepat</h3>
            <p>Ruang untuk kisah kasus nyata dengan foto dan pembaruan.</p>
          </div>
        </div>
      </section>

      <section className="k-section">
        <div className="k-container k-split">
          <div className="k-panel">
            <h2>Transparansi dana</h2>
            <div className="k-grid-3" style={{ marginTop: "1rem" }}>
              <div className="k-card">
                <strong>Dana masuk</strong>
                <p>{formatRp(totalCollected)}</p>
              </div>
              <div className="k-card">
                <strong>Digunakan</strong>
                <p>{formatRp(totalUsed)}</p>
              </div>
              <div className="k-card">
                <strong>Sisa</strong>
                <p>{formatRp(totalCollected - totalUsed)}</p>
              </div>
            </div>
          </div>
          <div className="k-panel">
            <h2>Bangun donor tetap</h2>
            <div className="k-form-mock" style={{ marginTop: "1rem" }}>
              <div className="k-field">Masukkan email untuk update bulanan</div>
              <div className="k-field">Minat: KIA / gizi / emergensi / cerita dampak</div>
              <a className="k-btn k-btn-primary" href="#">Daftar newsletter</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
