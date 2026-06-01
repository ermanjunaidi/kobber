import { useState, useEffect } from "react"
import { api, type Member } from "@/lib/api"

export default function Tentang() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.members.list()
      .then(setMembers)
      .catch((e) => {
        console.error("Failed to load members:", e)
        setError("Gagal memuat data anggota")
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="k-page">
      <section className="k-subhero">
        <div className="k-container">
          <div className="k-subhero-box">
            <span className="k-eyebrow">Halaman legitimasi forum</span>
            <h1>Tentang KOBBER</h1>
            <p>Forum multi-stakeholder untuk kesehatan ibu-anak dan pengentasan kemiskinan di Brebes.</p>
          </div>
        </div>
      </section>

      <section className="k-section">
        <div className="k-container k-sidebar-layout">
          <aside className="k-sidebar">
            <a href="#siapa">Identitas</a>
            <a href="#visi">Visi & misi</a>
            <a href="#tata">Tata kelola</a>
            <a href="#anggota">Direktori anggota</a>
          </aside>

          <div style={{ display: "grid", gap: "1.25rem" }}>
            {/* Identitas */}
            <section className="k-panel" id="siapa">
              <h2>Siapa kami</h2>
              <p>KOBBER adalah platform informasi publik, layanan AI warga, hub koordinasi anggota, dan ruang fundraising transparan.</p>
            </section>

            {/* Visi Misi */}
            <section className="k-grid-3" id="visi">
              <div className="k-card">
                <h3>Visi</h3>
                <p>Ekosistem gotong royong modern yang terukur, transparan, dan berdampak nyata.</p>
              </div>
              <div className="k-card">
                <h3>Misi</h3>
                <p>Mengorganisir sumber daya lintas aktor untuk menjawab isu AKI, AKB, stunting, dan GBV.</p>
              </div>
              <div className="k-card">
                <h3>Filosofi</h3>
                <p>Hangat, manusiawi, lokal, dan mudah dipahami warga, donor, media, serta anggota forum.</p>
              </div>
            </section>

            {/* Tata Kelola */}
            <section className="k-panel" id="tata">
              <h2>Tata kelola</h2>
              <div className="k-grid-4" style={{ marginTop: "1rem" }}>
                <div className="k-card">
                  <strong>Yayasan ESKA</strong>
                  <p>Penaung operasional.</p>
                </div>
                <div className="k-card">
                  <strong>CKI</strong>
                  <p>Pengetahuan dan riset.</p>
                </div>
                <div className="k-card">
                  <strong>Sekretariat KOBBER</strong>
                  <p>Pengelola harian.</p>
                </div>
                <div className="k-card">
                  <strong>Forum Anggota</strong>
                  <p>Lintas sektor.</p>
                </div>
              </div>
            </section>

            {/* Direktori Anggota */}
            <section className="k-panel" id="anggota">
              <h2>Direktori anggota</h2>
              <div style={{ margin: ".7rem 0" }}>
                <span className="k-tag">RS</span>
                <span className="k-tag">Universitas</span>
                <span className="k-tag">NGO</span>
                <span className="k-tag">Perusahaan</span>
                <span className="k-tag">Ormas</span>
              </div>
              <div className="k-grid-3">
                {loading ? (
                  <p className="k-text-muted">Memuat data anggota...</p>
                ) : error ? (
                  <p className="k-text-muted" style={{ color: "var(--k-red, #721c24)" }}>{error}</p>
                ) : (
                  members.map((member) => (
                    <div className="k-card" key={member.id}>
                      <strong>{member.name}</strong>
                      <p>{member.contribution}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}
