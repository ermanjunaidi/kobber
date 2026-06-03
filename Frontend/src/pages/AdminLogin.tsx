import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { useNavigate } from "react-router"
import { Shield, User, Lock, Loader2, AlertCircle } from "lucide-react"

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (isAuthenticated) {
    navigate("/admin", { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      navigate("/admin", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="k-admin-login-page">
      {/* Animated background orbs */}
      <div className="k-login-orb k-login-orb-1" />
      <div className="k-login-orb k-login-orb-2" />
      <div className="k-login-orb k-login-orb-3" />

      {/* Grid overlay */}
      <div className="k-login-grid" />

      <div className={`k-login-wrapper ${mounted ? "k-login-visible" : ""}`}>
        {/* Logo section */}
        <div className="k-login-brand">
          <div className="k-login-logo">
            <Shield size={28} />
          </div>
          <span className="k-login-brand-name">KOBBER</span>
          <span className="k-login-brand-sub">Admin Dashboard</span>
        </div>

        {/* Login card */}
        <div className="k-login-card">
          <div className="k-login-card-header">
            <h1 className="k-login-title">Selamat Datang</h1>
            <p className="k-login-subtitle">Masuk ke dashboard admin KOBBER</p>
          </div>

          {error && (
            <div className="k-login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="k-login-form">
            <div className="k-login-field">
              <label htmlFor="username" className="k-login-label">
                <User size={14} />
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="k-login-input"
              />
              <div className="k-login-input-glow" />
            </div>

            <div className="k-login-field">
              <label htmlFor="password" className="k-login-label">
                <Lock size={14} />
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="k-login-input"
              />
              <div className="k-login-input-glow" />
            </div>

            <button
              type="submit"
              className="k-login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="k-login-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="k-login-footer">
            <div className="k-login-divider">
              <span>Info</span>
            </div>
            <p className="k-login-credentials">
              Default: <code>admin</code> / <code>kobber123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
