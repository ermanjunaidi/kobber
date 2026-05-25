export default function Donasi() {
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
            <div className="k-amounts" style={{ marginTop: "1rem" }}>
              <div className="k-amount">Rp 25.000</div>
              <div className="k-amount active">Rp 50.000</div>
              <div className="k-amount">Rp 100.000</div>
              <div className="k-amount">Rp 250.000</div>
              <div className="k-amount">Rp 500.000</div>
              <div className="k-amount">Isi sendiri</div>
            </div>
            <div className="k-form-mock" style={{ marginTop: "1rem" }}>
              <div className="k-field">Program: USG ibu hamil / paket gizi / persalinan darurat</div>
              <div className="k-field">Jenis donasi: sekali / bulanan</div>
              <div className="k-field">Nama & email (opsional untuk laporan)</div>
              <a className="k-btn k-btn-secondary" href="#">Donasi sekarang</a>
            </div>
          </div>
          <div className="k-panel k-panel-accent-gold">
            <h2>Progress kampanye</h2>
            <p>Embed progress Kitabisa dan cerita lapangan singkat.</p>
            <div className="k-kpi-bar">
              <i style={{ width: "74%", background: "linear-gradient(90deg, var(--k-gold), var(--k-primary))" }} />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: ".75rem",
                fontWeight: 700,
              }}
            >
              <span>Rp 74.000.000</span>
              <span>dari target Rp 100.000.000</span>
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
                <p>Rp 18.000.000</p>
              </div>
              <div className="k-card">
                <strong>Digunakan</strong>
                <p>Rp 12.400.000</p>
              </div>
              <div className="k-card">
                <strong>Sisa</strong>
                <p>Rp 5.600.000</p>
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
