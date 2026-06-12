import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useNavigate } from "react-router"

interface AuthContextType {
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = "kobber_admin_token"

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const decoded = atob(base64)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== "number") return false
  return payload.exp * 1000 < Date.now()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if stored token is expired
    const stored = localStorage.getItem(TOKEN_KEY)
    if (stored && isTokenExpired(stored)) {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Login gagal" }))
      throw new Error(err.error || "Login gagal")
    }

    const data = await res.json()
    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/admin/login", { replace: true })
    }
  }, [loading, isAuthenticated, navigate])

  if (loading) {
    return (
      <div className="k-page" style={{ padding: "3rem 0" }}>
        <div className="k-container">
          <p className="k-text-muted">Memeriksa autentikasi...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
