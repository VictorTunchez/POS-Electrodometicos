import React, { useEffect, useState } from "react";
import servicioAutenticacion from "../../services/servicioAutenticacion";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import "./PanelPrincipal.css";

function PanelPrincipal() {
  const [saludo, setSaludo] = useState("");
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [sidebarColapsado, setSidebarColapsado] = useState(false);
  const [sidebarVisibleMobile, setSidebarVisibleMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchDatosUsuario = async () => {
      try {
        const mensaje = await servicioAutenticacion.obtenerSaludo();
        setSaludo(mensaje);

        // Obtener información del usuario desde el token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUsuario({
              nombre: payload.nombre || 'Usuario',
              email: payload.email || '',
              rol: payload.rol || 'Usuario'
            });
          } catch (e) {
            console.error('Error al decodificar token:', e);
          }
        }
      } catch (err) {
        setError("Acceso denegado: No se pudo obtener los datos");
        localStorage.removeItem('token');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    fetchDatosUsuario();
  }, [navigate]);

  // Controlar el scroll del body cuando el sidebar móvil está abierto
  useEffect(() => {
    if (sidebarVisibleMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarVisibleMobile]);

  // Cerrar menús al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Cerrar menú de usuario
      const userSection = document.querySelector('.user-section');
      if (userSection && !userSection.contains(event.target)) {
        setMostrarMenu(false);
      }

      // Cerrar sidebar móvil al hacer clic en el overlay
      const overlay = document.querySelector('.sidebar-overlay');
      if (overlay && overlay.contains(event.target) && sidebarVisibleMobile) {
        setSidebarVisibleMobile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarVisibleMobile]);

  const handleCerrarSesion = () => {
    servicioAutenticacion.logout();
    localStorage.removeItem('token');
    navigate('/login');
  };

  const modulos = [
    {
      id: 1,
      nombre: "Inicio",
      ruta: "/panel",
      icono: "bi-house-door",
      descripcion: "Página principal del sistema"
    },
    {
      id: 2,
      nombre: "Usuarios",
      ruta: "/panel/usuarios",
      icono: "bi-people-fill",
      descripcion: "Administra usuarios y permisos"
    },
    {
      id: 3,
      nombre: "Sucursales",
      ruta: "/panel/sucursales",
      icono: "bi-shop",
      descripcion: "Gestiona puntos de venta"
    },
    {
      id: 4,
      nombre: "Roles y Permisos",
      ruta: "/panel/roles",
      icono: "bi-shield-lock",
      descripcion: "Controla accesos y privilegios"
    },
    // NUEVO: Módulo de Productos (agrupa los 3 componentes)
    {
      id: 5,
      nombre: "Bodega",
      ruta: "/panel/productos",
      icono: "bi-box-seam",
      descripcion: "Gestión de productos e inventario"
    }
  ];

  // Obtener el módulo actual basado en la ruta
  const obtenerModuloActual = () => {
    const rutaActual = location.pathname;
    if (rutaActual === "/panel") return modulos[0];

    const modulo = modulos.find(m => m.ruta === rutaActual);
    return modulo || modulos[0];
  };

  const moduloActual = obtenerModuloActual();

  // Función para renderizar el contenido del dashboard
  const renderDashboard = () => (
    <div className="dashboard-content">
      <h2 className="welcome-title">{saludo}</h2>
      <p className="welcome-subtitle">Venta de electrodomesticos y mas... </p>
    </div>
  );

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className="error-text">
            <h3>{error}</h3>
            <p>Redirigiendo al login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`panel-container ${sidebarColapsado ? 'sidebar-colapsado' : ''}`}>
      {/* Sidebar de navegación */}
      <aside className={`sidebar ${sidebarVisibleMobile ? 'mobile-visible' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-section">
            {(!sidebarColapsado || sidebarVisibleMobile) && (
              <div className="brand-text">
                <h1 className="panel-title">El Hogar</h1>
                <p className="panel-subtitle">Sistema POS</p>
              </div>
            )}
          </div>
          {/* Este botón solo se muestra en desktop (no en móviles) */}
          {!sidebarVisibleMobile && (
            <button
              className="toggle-sidebar"
              onClick={() => setSidebarColapsado(!sidebarColapsado)}
            >
              <i className={`bi ${sidebarColapsado ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <ul className="modulos-list">
            {modulos.map(modulo => (
              <li
                key={modulo.id}
                className={`modulo-item ${location.pathname === modulo.ruta ? 'active' : ''}`}
                onClick={() => {
                  navigate(modulo.ruta);
                  if (window.innerWidth <= 768) {
                    setSidebarVisibleMobile(false);
                  }
                }}
              >
                <div className="modulo-icon">
                  <i className={`bi ${modulo.icono}`}></i>
                </div>
                {(!sidebarColapsado || sidebarVisibleMobile) && (
                  <div className="modulo-info">
                    <span className="modulo-name">{modulo.nombre}</span>
                    <span className="modulo-desc">{modulo.descripcion}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay para móviles */}
      {sidebarVisibleMobile && (
        <div
          className="sidebar-overlay mobile-visible"
          onClick={() => setSidebarVisibleMobile(false)}
        ></div>
      )}

      {/* Contenido principal */}
      <div className="main-content">
        {/* Header con navegación */}
        <header className="panel-header">
          <div className="header-content">
            <div className="page-info">
              <h2 className="page-title">{moduloActual.nombre}</h2>
              <p className="page-description">{moduloActual.descripcion}</p>
            </div>

            <div className="user-section">
              <div
                className="user-info"
                onClick={() => setMostrarMenu(!mostrarMenu)}
              >
                <div className="user-avatar">
                  <i className="bi bi-person-circle"></i>
                </div>
                <div className="user-details">
                  <span className="user-name">{usuario?.nombre || 'Usuario'}</span>
                  <span className="user-role">{usuario?.rol || 'Usuario'}</span>
                </div>
                <i className={`bi bi-chevron-down dropdown-icon ${mostrarMenu ? 'rotate' : ''}`}></i>
              </div>

              {mostrarMenu && (
                <div className="user-menu show">
                  <div
                    className="menu-item logout-item"
                    onClick={handleCerrarSesion}
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Cerrar Sesión</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Área de contenido */}
        <main className="content-area">
          {location.pathname === "/panel" ? renderDashboard() : <Outlet />}
        </main>

        <footer className="panel-footer">
          <p className="footer-text">El Hogar © {new Date().getFullYear()}</p>
        </footer>
      </div>

      {/* Botón de toggle para móviles */}
      <button
        className="mobile-toggle"
        onClick={() => setSidebarVisibleMobile(!sidebarVisibleMobile)}
      >
        <i className={`bi ${sidebarVisibleMobile ? 'bi-x-lg' : 'bi-list'}`}></i>
      </button>
    </div>
  );
}

export default PanelPrincipal;