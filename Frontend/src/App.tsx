import { BrowserRouter, Routes, Route } from "react-router"
import { AuthProvider, ProtectedRoute } from "@/lib/auth"
import Layout from "@/components/Layout"
import Beranda from "@/pages/Beranda"
import Tentang from "@/pages/Tentang"
import IsuBrebes from "@/pages/IsuBrebes"
import Bergabung from "@/pages/Bergabung"
import Donasi from "@/pages/Donasi"
import Admin from "@/pages/Admin"
import AdminLogin from "@/pages/AdminLogin"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Beranda />} />
            <Route path="/tentang" element={<Tentang />} />
            <Route path="/isu-brebes" element={<IsuBrebes />} />
            <Route path="/bergabung" element={<Bergabung />} />
            <Route path="/donasi" element={<Donasi />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
