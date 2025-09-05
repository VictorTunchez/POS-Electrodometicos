import { useState } from 'react'
import './App.css'
import FormularioLogin from "./components/auth/FormularioLogin";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FormularioCambiarContrasena from "./components/auth/FormularioCambiarContrasena";
import PanelPrincipal from "./components/admin/PanelPrincipal";
import Usuarios from "./components/admin/Usuarios";
import Sucursales from "./components/admin/Sucursales";
import Roles from "./components/admin/Roles";

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas EXACTAMENTE como las tenías */}
        <Route path="/" element={<FormularioLogin />} />
        <Route path="/login" element={<FormularioLogin />} />
        <Route path="/cambiar-contrasena" element={<FormularioCambiarContrasena />} />
        <Route path="/panel" element={<PanelPrincipal />} />

        {/* NUEVAS rutas que agregamos */}
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/sucursales" element={<Sucursales />} />
        <Route path="/roles" element={<Roles />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App