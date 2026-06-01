import { useState } from "react"
import { api } from "@/lib/api"

export default function Bergabung() {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("anggota forum")
  const [contact, setContact] = useState("")
  const [interest, setInterest] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)
    try {
      await api.contact.submit({
        name,
        category,
        contact,
        interest,
        message,
      })
      setStatus({ type: "success", text: "Pendaftaran berhasil dikirim! Tim KOBBER akan menghubungi Anda." })
      setName("")
      setCategory("anggota forum")
      setContact("")
      setInterest("")
      setMessage("")
    } catch (e) {
      setStatus({ type: "error", text: e instanceof Error ? e.message : "Gagal mengirim pendaftaran" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="k-page">
      <section className="k-subhero">
        <div className="k-container">
          <div className="k-subhero-box">
            <span className="k-eyebrow">Konversi multi-audiens</span>
            <h1>Bergabung dengan KOBBER</h1>
            <p>Jalur partisipasi yang jelas untuk anggota forum, mahasiswa magang, relawan, dan mitra CSR.</p>
          </div>
        </div>
      </section>

      <section className="k-section">
        <div className="k-container k-join-grid">
          <div className="k-card">
            <span className="k-tag k-accent-green">Anggota Forum</span>
            <h3>Institusi & organisasi</h3>
            <p>Rumah sakit, universitas, NGO, ormas, dan perusahaan lokal.</p>
          </div>
          <div className="k-card">
            <span className="k-tag k-accent-blue">Magang</span>
            <h3>Mahasiswa & pelajar</h3>
            <p>Kontribusi riset, konten, data, dan dukungan operasional.</p>
          </div>
          <div className="k-card">
            <span className="k-tag k-accent-purple">Relawan</span>
            <h3>Kontributor program</h3>
            <p>Dokumentasi, desain, pelatihan, dan penggalangan jejaring.</p>
          </div>
          <div className="k-card">
            <span className="k-tag k-accent-gold">CSR</span>
            <h3>Mitra pendanaan</h3>
            <p>Kolaborasi berbasis hasil, paket dampak, dan branding sosial.</p>
          </div>
        </div>
      </section>

      <section className="k-section k-section-alt">
        <div className="k-container k-split">
          <div className="k-panel">
            <h2>Manfaat bergabung</h2>
            <ul style={{ paddingLeft: "1.1rem", color: "var(--k-text-muted)" }}>
              <li>Jejaring multi-stakeholder yang aktif dan terdokumentasi.</li>
              <li>Ruang kolaborasi program, data, riset, dan advokasi.</li>
              <li>Visibilitas publik melalui direktori anggota dan kanal komunikasi KOBBER.</li>
              <li>Kesempatan kontribusi nyata untuk isu ibu dan anak Brebes.</li>
            </ul>
          </div>
          <div className="k-panel">
            <h2>Form pendaftaran</h2>
            {status && (
              <div style={{
                padding: ".75rem",
                borderRadius: ".5rem",
                marginBottom: ".75rem",
                background: status.type === "success" ? "var(--k-green-light, #d4edda)" : "var(--k-red-light, #f8d7da)",
                color: status.type === "success" ? "var(--k-green, #155724)" : "var(--k-red, #721c24)",
              }}>
                {status.text}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="k-form-mock" style={{ marginTop: "1rem" }}>
                <input
                  type="text"
                  placeholder="Nama lembaga / nama lengkap *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
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

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                >
                  <option value="anggota forum">Anggota Forum</option>
                  <option value="magang">Magang</option>
                  <option value="relawan">Relawan</option>
                  <option value="CSR">CSR</option>
                </select>

                <input
                  type="text"
                  placeholder="Kontak PIC & email aktif *"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
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
                  type="text"
                  placeholder="Minat kontribusi / program"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
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

                <textarea
                  placeholder="Pesan tambahan"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: ".6rem .8rem",
                    borderRadius: ".5rem",
                    border: "1px solid var(--k-border)",
                    background: "transparent",
                    color: "inherit",
                    fontSize: "1rem",
                    marginBottom: ".75rem",
                    resize: "vertical",
                  }}
                />

                <button
                  type="submit"
                  className="k-btn k-btn-primary"
                  disabled={submitting}
                  style={{ width: "100%" }}
                >
                  {submitting ? "Memproses..." : "Kirim pendaftaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="k-section">
        <div className="k-container">
          <h2>Paket kemitraan CSR</h2>
          <div className="k-pricing-grid" style={{ marginTop: "1rem" }}>
            <div className="k-card">
              <span className="k-tag k-accent-gold">Perunggu</span>
              <h3>Rp 50 juta</h3>
              <p>Intervensi pendek untuk 1 desa prioritas.</p>
            </div>
            <div className="k-card">
              <span className="k-tag k-accent-blue">Perak</span>
              <h3>Rp 150 juta</h3>
              <p>Program menengah untuk dukungan layanan lapangan.</p>
            </div>
            <div className="k-card">
              <span className="k-tag k-accent-green">Emas</span>
              <h3>Rp 500 juta</h3>
              <p>Kemitraan tahunan berskala besar dengan dashboard dampak.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
