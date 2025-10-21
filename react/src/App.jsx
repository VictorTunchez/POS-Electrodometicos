import { useState } from 'react'
import './App.css'
import FormularioLogin from "./components/auth/FormularioLogin";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FormularioCambiarContrasena from "./components/auth/FormularioCambiarContrasena";
import PanelPrincipal from "./components/admin/PanelPrincipal";
import Usuarios from "./components/admin/users/Usuarios";
import Sucursales from "./components/admin/sucursales/Sucursales";
import Roles from "./components/admin/roles/Roles";
import Categorias from "./components/admin/categorias/Categorias";
import Productos from "./components/admin/products/Productos";
import LayoutProductos from "./components/admin/products/LayoutProductos";
import Proveedores from "./components/admin/suppliers/Proveedores";
import Compras from "./components/admin/compras/Compras";
import Clientes from "./components/admin/clientes/Clientes";
import Ventas from "./components/admin/ventas/Ventas";
// import VentaExito from "./components/admin/ventas/VentaExito";
import Traslados from "./components/admin/products/traslados/Traslados";

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<FormularioLogin />} />
        <Route path="/cambiar-contrasena" element={<FormularioCambiarContrasena />} />

        {/* Ruta principal del panel con rutas anidadas */}
        <Route path="/panel/*" element={<PanelPrincipal />}>
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="sucursales" element={<Sucursales />} />
          <Route path="roles" element={<Roles />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="compras" element={<Compras />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="ventas" element={<Ventas />} />
          {/* <Route path="ventas/exito" element={<VentaExito />} /> */}

          {/* NUEVO: Rutas para el módulo de Productos */}
          <Route path="productos" element={<LayoutProductos />}>
            <Route index element={<Navigate to="categorias" replace />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="productos" element={<Productos />} />
            <Route path="traslados" element={<Traslados />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App