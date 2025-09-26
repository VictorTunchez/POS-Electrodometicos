import { useState } from 'react'
import './App.css'
import FormularioLogin from "./components/auth/FormularioLogin";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FormularioCambiarContrasena from "./components/auth/FormularioCambiarContrasena";
import PanelPrincipal from "./components/admin/PanelPrincipal";
import Usuarios from "./components/admin/Usuarios";
import Sucursales from "./components/admin/Sucursales";
import Roles from "./components/admin/Roles";
import Categorias from "./components/admin/Categorias";
import Productos from "./components/admin/products/Productos";
import LayoutProductos from "./components/admin/LayoutProductos";

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/panel" replace />} />
        <Route path="/login" element={<FormularioLogin />} />
        <Route path="/cambiar-contrasena" element={<FormularioCambiarContrasena />} />

        {/* Ruta principal del panel con rutas anidadas */}
        <Route path="/panel/*" element={<PanelPrincipal />}>
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="sucursales" element={<Sucursales />} />
          <Route path="roles" element={<Roles />} />

          {/* NUEVO: Rutas para el módulo de Productos */}
          <Route path="productos" element={<LayoutProductos />}>
            <Route index element={<Navigate to="categorias" replace />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="productos" element={<Productos />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App