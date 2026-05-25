export default function Bergabung() {
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
            <div className="k-form-mock" style={{ marginTop: "1rem" }}>
              <div className="k-field">Nama lembaga / nama lengkap</div>
              <div className="k-field">Kategori: anggota forum / magang / relawan / CSR</div>
              <div className="k-field">Kontak PIC & email aktif</div>
              <div className="k-field">Minat kontribusi / program yang diminati</div>
              <a className="k-btn k-btn-primary" href="donasi.html">Kirim pendaftaran</a>
            </div>
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
