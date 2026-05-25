import { BrowserRouter, Routes, Route } from "react-router"
import Layout from "@/components/Layout"
import Beranda from "@/pages/Beranda"
import Tentang from "@/pages/Tentang"
import IsuBrebes from "@/pages/IsuBrebes"
import Bergabung from "@/pages/Bergabung"
import Donasi from "@/pages/Donasi"

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/isu-brebes" element={<IsuBrebes />} />
          <Route path="/bergabung" element={<Bergabung />} />
          <Route path="/donasi" element={<Donasi />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
