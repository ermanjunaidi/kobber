import { useState, useEffect, type ReactNode } from "react"
import { Link, useLocation } from "react-router"

const navItems = [
  { path: "/", label: "Beranda" },
  { path: "/tentang", label: "Tentang" },
  { path: "/isu-brebes", label: "Isu Brebes" },
  { path: "/bergabung", label: "Bergabung" },
  { path: "/donasi", label: "Donasi" },
]

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false)
    }
    if (isSidebarOpen) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [isSidebarOpen])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  const closeSidebar = () => setIsSidebarOpen(false)

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <header className="k-header">
        <div className="k-container k-header-inner">
          <Link to="/" className="k-brand">
            <span className="k-logo-mark">K</span>
            <span>
              <span style={{ display: "block", fontSize: "1rem", lineHeight: 1 }}>KOBBER</span>
              <span className="k-tiny k-text-muted">Komunitas Brebes Bersama</span>
            </span>
          </Link>
          <nav className="k-nav">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className={isActive(item.path) ? "active" : ""}>
                {item.label}
              </Link>
            ))}
            <Link to="/" className="k-btn k-btn-purple k-nav-btn">
              Bidan Maya
            </Link>
            <Link to="/donasi" className="k-btn k-btn-secondary k-nav-btn">
              Donasi Sekarang
            </Link>
            <button className="k-theme-toggle" onClick={toggleTheme} aria-label="Ganti mode">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </nav>

          {/* Hamburger */}
          <button
            className={`k-hamburger ${isSidebarOpen ? "open" : ""}`}
            onClick={() => setIsSidebarOpen((v) => !v)}
            aria-label="Buka menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Sidebar overlay */}
      <div
        className={`k-sidebar-overlay ${isSidebarOpen ? "visible" : ""}`}
        onClick={closeSidebar}
      />

      {/* Sidebar drawer */}
      <aside className={`k-sidebar-drawer ${isSidebarOpen ? "open" : ""}`}>
        <div className="k-sidebar-header">
          <Link to="/" className="k-brand" onClick={closeSidebar}>
            <span className="k-logo-mark">K</span>
            <span>
              <span style={{ display: "block", fontSize: "1rem", lineHeight: 1 }}>KOBBER</span>
              <span className="k-tiny k-text-muted">Komunitas Brebes Bersama</span>
            </span>
          </Link>
          <button className="k-sidebar-close" onClick={closeSidebar} aria-label="Tutup menu">
            ✕
          </button>
        </div>

        <nav className="k-sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`k-sidebar-link ${isActive(item.path) ? "active" : ""}`}
              onClick={closeSidebar}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="k-sidebar-actions">
          <Link to="/" className="k-btn k-btn-purple" onClick={closeSidebar}>
            Bidan Maya
          </Link>
          <Link to="/donasi" className="k-btn k-btn-secondary" onClick={closeSidebar}>
            Donasi Sekarang
          </Link>
        </div>

        <div className="k-sidebar-footer">
          <button className="k-theme-toggle" onClick={toggleTheme} aria-label="Ganti mode">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <span className="k-tiny k-text-muted">Mode {theme === "dark" ? "terang" : "gelap"}</span>
        </div>
      </aside>

      <main>{children}</main>

      {/* Floating Buttons */}
      <div className="k-floating-left">
        <Link to="/donasi" className="k-float-btn k-float-donate">
          ❤ Donasi Sekarang
        </Link>
      </div>
      <div className="k-floating-right">
        <Link to="/" className="k-float-btn k-float-ai">
          ✦ Bidan Maya
        </Link>
      </div>

      <footer className="k-site-footer">
        <div className="k-container k-footer-grid">
          <div>
            <div className="k-brand" style={{ marginBottom: ".75rem" }}>
              <span className="k-logo-mark">K</span>
              <span>
                <span style={{ display: "block", fontSize: "1rem", lineHeight: 1 }}>KOBBER</span>
                <span className="k-tiny k-text-muted">Komunitas Brebes Bersama</span>
              </span>
            </div>
            <p className="k-text-muted">
              Forum multi-stakeholder untuk kesehatan ibu-anak dan pengentasan kemiskinan di Brebes.
            </p>
          </div>
          <div>
            <strong style={{ display: "block", marginBottom: ".6rem" }}>Tautan cepat</strong>
            <div className="k-tiny k-text-muted" style={{ display: "grid", gap: ".5rem" }}>
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  {item.label}
                </Link>
              ))}
                <Link to="/admin" style={{ color: "var(--k-text-faint)", fontSize: ".8rem" }}>
                  Admin
                </Link>
            </div>
          </div>
          <div>
            <strong style={{ display: "block", marginBottom: ".6rem" }}>Triple logo system</strong>
            <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
              <span className="k-tag">KOBBER</span>
              <span className="k-tag">CKI</span>
              <span className="k-tag">Yayasan ESKA</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
