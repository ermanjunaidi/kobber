import { BrowserRouter, Routes, Route } from "react-router"
import { AuthProvider, ProtectedRoute } from "@/lib/auth"
import { TooltipProvider } from "@/components/ui/tooltip"
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
        <TooltipProvider>
        <Routes>
          {/* Public routes with layout */}
          <Route path="/" element={<Layout><Beranda /></Layout>} />
          <Route path="/tentang" element={<Layout><Tentang /></Layout>} />
          <Route path="/isu-brebes" element={<Layout><IsuBrebes /></Layout>} />
          <Route path="/bergabung" element={<Layout><Bergabung /></Layout>} />
          <Route path="/donasi" element={<Layout><Donasi /></Layout>} />
          {/* Admin routes without layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
        </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
