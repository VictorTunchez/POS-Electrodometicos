// components/admin/LayoutProductos.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import "./LayoutProductos.css";

function LayoutProductos() {
  const navigate = useNavigate();

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="header-top">
          <button
            className="btn btn-outline-secondary back-button"
            onClick={() => navigate('/panel')}
          >
            <i className="bi bi-arrow-left me-2"></i> Volver al Inicio
          </button>
          <h1>Bodega</h1>
        </div>

        {/* Navegación secundaria */}
        <nav className="subnavigation nav nav-tabs mb-4">
          <NavLink
            to="/panel/productos/categorias"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-tag me-2"></i>Categorías
          </NavLink>
          <NavLink
            to="/panel/productos/productos"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-box me-2"></i>Productos
          </NavLink>
          {/* NUEVO: Enlace para Traslados */}
          <NavLink
            to="/panel/productos/traslados"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-arrow-left-right me-2"></i>Traslados
          </NavLink>
        </nav>
      </div>

      <Outlet /> {/* Aquí se renderizan los componentes hijos */}
    </div>
  );
}

export default LayoutProductos;