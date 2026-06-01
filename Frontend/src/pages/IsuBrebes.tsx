export default function IsuBrebes() {
  return (
    <div className="k-page">
      <section className="k-subhero">
        <div className="k-container">
          <div className="k-subhero-box">
            <span className="k-eyebrow">Mesin legitimasi donor & media</span>
            <h1>Data & Fakta KIA Brebes</h1>
            <p>Halaman data untuk menjawab apa masalahnya, seberapa besar skalanya, dan mengapa intervensi dibutuhkan sekarang.</p>
          </div>
        </div>
      </section>

      <section className="k-section">
        <div className="k-container k-grid-4">
          <div className="k-card">
            <strong>AKI 172</strong>
            <p>per 100.000 kelahiran</p>
          </div>
          <div className="k-card">
            <strong>AKB 21</strong>
            <p>per 1.000 kelahiran</p>
          </div>
          <div className="k-card">
            <strong>27,4%</strong>
            <p>indikasi stunting prioritas</p>
          </div>
          <div className="k-card">
            <strong>14,8%</strong>
            <p>tekanan kemiskinan wilayah sasaran</p>
          </div>
        </div>
      </section>

      <section className="k-section k-section-alt">
        <div className="k-container k-split">
          <div className="k-panel">
            <h2>Tren 5 tahun</h2>
            <div className="k-mini-chart" style={{ marginTop: "1rem", height: "260px" }}>
              <div className="k-bars" style={{ height: "170px" }}>
                <span style={{ height: "84%" }} />
                <span style={{ height: "74%" }} />
                <span style={{ height: "68%" }} />
                <span style={{ height: "60%" }} />
                <span style={{ height: "52%" }} />
              </div>
            </div>
            <p>Ruang chart utama untuk menampilkan perbaikan atau kemunduran indikator KIA dan kemiskinan.</p>
          </div>
          <div className="k-panel">
            <h2>Perbandingan wilayah</h2>
            <ul style={{ paddingLeft: "1.1rem", color: "var(--k-text-muted)" }}>
              <li>Brebes vs Jawa Tengah vs Nasional.</li>
              <li>Catatan metodologi dan sumber data resmi di bawah chart.</li>
              <li>Tanggal update wajib terlihat.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="k-section">
        <div className="k-container">
          <h2>Peta zona merah</h2>
          <div className="k-map-box" style={{ marginTop: "1rem" }}>
            <span className="k-map-dot" style={{ left: "18%", top: "36%" }} />
            <span className="k-map-dot" style={{ left: "49%", top: "48%" }} />
            <span className="k-map-dot" style={{ left: "72%", top: "30%" }} />
            <span className="k-map-dot" style={{ left: "61%", top: "66%" }} />
          </div>
          <div className="k-grid-3" style={{ marginTop: "1rem" }}>
            <div className="k-card">
              <strong>Sumber data</strong>
              <p>BPS, Dinkes, riset CKI, dan pembaruan magang.</p>
            </div>
            <div className="k-card">
              <strong>Status data</strong>
              <p>Banner peringatan saat update lebih dari 3 bulan.</p>
            </div>
            <div className="k-card">
              <strong>Unduhan PDF</strong>
              <p>Versi ringkas untuk kader dan mitra lapangan.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
