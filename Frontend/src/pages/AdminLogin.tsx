import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { useNavigate } from "react-router"

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
    <div className="k-page" style={{ padding: "4rem 0" }}>
      <div className="k-container" style={{ maxWidth: "440px", margin: "0 auto" }}>
        <div className="k-panel" style={{ textAlign: "center", padding: "2.5rem" }}>
          <div className="k-logo-mark" style={{ margin: "0 auto 1rem", width: 56, height: 56, borderRadius: 16, fontSize: 24 }}>
            K
          </div>
          <h1 style={{ margin: 0 }}>Login Admin</h1>
          <p className="k-text-muted" style={{ marginTop: ".35rem" }}>Masuk ke dashboard admin KOBBER</p>

          {error && (
            <div style={{
              padding: ".75rem",
              borderRadius: ".5rem",
              marginTop: "1rem",
              background: "var(--k-danger-bg)",
              color: "var(--k-danger)",
              fontSize: ".9rem",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem", display: "grid", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: ".75rem 1rem",
                borderRadius: ".75rem",
                border: "1px solid var(--k-border)",
                background: "transparent",
                color: "inherit",
                fontSize: "1rem",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: ".75rem 1rem",
                borderRadius: ".75rem",
                border: "1px solid var(--k-border)",
                background: "transparent",
                color: "inherit",
                fontSize: "1rem",
              }}
            />
            <button
              type="submit"
              className="k-btn k-btn-primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: ".85rem" }}
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>

          <p className="k-tiny k-text-muted" style={{ marginTop: "1.5rem" }}>
            Default: admin / kobber123
          </p>
        </div>
      </div>
    </div>
  )
}
