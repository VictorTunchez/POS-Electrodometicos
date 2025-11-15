import React, { useEffect, useState, useRef } from "react";
import servicioAutenticacion from "../../services/servicioAutenticacion";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import "./PanelPrincipal.css";
import Dashboard from "../admin/Dashboard";
 import logo from "./icono.png"; // ruta relativa al componente

function PanelPrincipal() {
  const [saludo, setSaludo] = useState("");
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [sidebarColapsado, setSidebarColapsado] = useState(false);
  const [sidebarVisibleMobile, setSidebarVisibleMobile] = useState(false);
  const [gruposExpandidos, setGruposExpandidos] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const sidebarRef = useRef(null);

  // Agrupación lógica de módulos
  const gruposModulos = [
    {
      id: "dashboard",
      nombre: "Dashboard",
      icono: "bi-speedometer2",
      modulos: [
        {
          id: 1,
          nombre: "Inicio",
          ruta: "/panel",
          icono: "bi-house-door",
          descripcion: "Página principal del sistema"
        }
      ]
    },
    {
      id: "administracion",
      nombre: "Administración",
      icono: "bi-gear-fill",
      modulos: [
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
        {
          id: 10,
          nombre: "Tarjetas de Regalo",
          ruta: "/panel/tarjetas-regalo",
          icono: "bi-gift-fill",
          descripcion: "Gestión de tarjetas de regalo"
        }
      ]
    },
    {
      id: "inventario",
      nombre: "Inventario",
      icono: "bi-box-seam",
      modulos: [
        {
          id: 5,
          nombre: "Bodega",
          ruta: "/panel/productos",
          icono: "bi-box-seam",
          descripcion: "Gestión de productos e inventario"
        },
        {
          id: 6,
          nombre: "Proveedores",
          ruta: "/panel/proveedores",
          icono: "bi-person-fill",
          descripcion: "Gestión de proveedores"
        },
        {
          id: 7,
          nombre: "Compras",
          ruta: "/panel/compras",
          icono: "bi-cart-plus",
          descripcion: "Gestión de compras"
        }
      ]
    },
    {
      id: "ventas",
      nombre: "Ventas",
      icono: "bi-currency-dollar",
      modulos: [
        {
          id: 8,
          nombre: "Clientes",
          ruta: "/panel/clientes",
          icono: "bi-people",
          descripcion: "Gestión de clientes"
        },
        {
          id: 9,
          nombre: "Ventas",
          ruta: "/panel/ventas",
          icono: "bi-currency-dollar",
          descripcion: "Gestión de ventas"
        }
      ]
    }
  ];

  useEffect(() => {
    const fetchDatosUsuario = async () => {
      try {
        const mensaje = await servicioAutenticacion.obtenerSaludo();
        setSaludo(mensaje);

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

    // Cargar estado de grupos desde localStorage o inicializar
    const estadoGuardado = localStorage.getItem('sidebarGruposExpandidos');
    if (estadoGuardado) {
      setGruposExpandidos(JSON.parse(estadoGuardado));
    } else {
      // Estado inicial: solo el dashboard expandido
      const estadoInicial = {};
      gruposModulos.forEach(grupo => {
        estadoInicial[grupo.id] = grupo.id === "dashboard"; // Solo dashboard expandido
      });
      setGruposExpandidos(estadoInicial);
    }
  }, [navigate]);

  // Guardar estado de grupos en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('sidebarGruposExpandidos', JSON.stringify(gruposExpandidos));
  }, [gruposExpandidos]);

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
      if (menuRef.current && !menuRef.current.contains(event.target)) {
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

  const toggleGrupo = (grupoId, event) => {
    // Prevenir que el evento se propague y cierre el grupo automáticamente
    if (event) {
      event.stopPropagation();
    }
    setGruposExpandidos(prev => ({
      ...prev,
      [grupoId]: !prev[grupoId]
    }));
  };

  // Obtener el módulo actual basado en la ruta
  const obtenerModuloActual = () => {
    const rutaActual = location.pathname;

    // Buscar en todos los grupos
    for (const grupo of gruposModulos) {
      const modulo = grupo.modulos.find(m => m.ruta === rutaActual);
      if (modulo) return modulo;
    }

    // Si no se encuentra, devolver el dashboard
    return gruposModulos[0].modulos[0];
  };

  const moduloActual = obtenerModuloActual();

  // Función para renderizar el contenido del dashboard
  const renderDashboard = () => (
    <Dashboard />
  );

  // Navegar a un módulo
  const navegarAModulo = (ruta, event) => {
    // Prevenir que el evento se propague y afecte al grupo padre
    if (event) {
      event.stopPropagation();
    }
    navigate(ruta);
    if (window.innerWidth <= 768) {
      setSidebarVisibleMobile(false);
    }
  };

  // Función para manejar teclado en elementos del sidebar
  const manejarTecladoModulo = (event, modulo) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      navegarAModulo(modulo.ruta, event);
    }
  };

  // Función para manejar teclado en grupos
  const manejarTecladoGrupo = (event, grupoId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      toggleGrupo(grupoId, event);
    }
  };

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
      <aside
        className={`sidebar ${sidebarVisibleMobile ? 'mobile-visible' : ''}`}
        aria-label="Navegación principal"
        ref={sidebarRef}
      >
        <div className="sidebar-header">
            <div
              className="brand-section"
              style={{
                padding: "0px",                // sin padding
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start"   // alinea a la izquierda
              }}
            >
              {(!sidebarColapsado || sidebarVisibleMobile) && (
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    width: "145px",      // ajusta tamaño
                    height: "auto",
                    objectFit: "contain",
                    marginLeft: "6px"    // margen SUAVE opcional (ajústalo o borralo)
                  }}
                />
              )}
            </div>
          {/* Este botón solo se muestra en desktop (no en móviles) */}
          {!sidebarVisibleMobile && (
            <button
              className="toggle-sidebar"
              onClick={() => setSidebarColapsado(!sidebarColapsado)}
              aria-label={sidebarColapsado ? "Expandir sidebar" : "Contraer sidebar"}
            >
              <i className={`bi ${sidebarColapsado ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
            </button>
          )}
        </div>
        <nav className="sidebar-nav" aria-label="Módulos del sistema">
          <ul className="grupos-list">
            {gruposModulos.map(grupo => (
              <li key={grupo.id} className="grupo-item">
                {/* Encabezado del grupo - solo visible cuando el sidebar no está colapsado */}
                {(!sidebarColapsado || sidebarVisibleMobile) && grupo.modulos.length > 1 ? (
                  <div
                    className="grupo-header"
                    onClick={(e) => toggleGrupo(grupo.id, e)}
                    onKeyDown={(e) => manejarTecladoGrupo(e, grupo.id)}
                    tabIndex={0}
                    role="button"
                    aria-expanded={gruposExpandidos[grupo.id]}
                    aria-controls={`grupo-${grupo.id}-modulos`}
                    aria-label={`${grupo.nombre}, ${gruposExpandidos[grupo.id] ? 'expandido' : 'colapsado'}`}
                  >
                    <div className="grupo-icon">
                      <i className={`bi ${grupo.icono}`}></i>
                    </div>
                    <span className="grupo-name">{grupo.nombre}</span>
                    <i
                      className={`bi grupo-chevron ${gruposExpandidos[grupo.id] ? 'bi-chevron-down' : 'bi-chevron-right'}`}
                    ></i>
                  </div>
                ) : (!sidebarColapsado || sidebarVisibleMobile) && (
                  // Para grupos con un solo módulo, mostrar como encabezado simple
                  <div className="grupo-header-simple">
                    <div className="grupo-icon">
                      <i className={`bi ${grupo.icono}`}></i>
                    </div>
                    <span className="grupo-name">{grupo.nombre}</span>
                  </div>
                )}

                {/* Lista de módulos del grupo */}
                <ul
                  id={`grupo-${grupo.id}-modulos`}
                  className={`modulos-list ${!gruposExpandidos[grupo.id] && grupo.modulos.length > 1 ? 'colapsado' : ''} ${sidebarColapsado && !sidebarVisibleMobile ? 'sidebar-colapsado' : ''}`}
                >
                  {grupo.modulos.map(modulo => (
                    <li
                      key={modulo.id}
                      className={`modulo-item ${location.pathname === modulo.ruta ? 'active' : ''}`}
                      onClick={(e) => navegarAModulo(modulo.ruta, e)}
                      onKeyDown={(e) => manejarTecladoModulo(e, modulo)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Ir a ${modulo.nombre}: ${modulo.descripcion}`}
                      aria-current={location.pathname === modulo.ruta ? "page" : undefined}
                    >
                      <div className="modulo-icon">
                        <i className={`bi ${modulo.icono}`} aria-hidden="true"></i>
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
          aria-hidden="true"
        ></div>
      )}

      {/* Contenido principal */}
      <div className="main-content">
        {/* Header con navegación */}
        <header className="panel-header">
          <div className="header-content">
            <div className="page-info">
              <h1 className="page-title">{moduloActual.nombre}</h1>
              <p className="page-description">{moduloActual.descripcion}</p>
            </div>

            <div className="user-section" ref={menuRef}>
              <div
                className="user-info"
                onClick={() => setMostrarMenu(!mostrarMenu)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setMostrarMenu(!mostrarMenu);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-haspopup="true"
                aria-expanded={mostrarMenu}
                aria-label="Menú de usuario"
              >
                <div className="user-avatar">
                  <i className="bi bi-person-circle" aria-hidden="true"></i>
                </div>
                <div className="user-details">
                  <span className="user-name">{usuario?.nombre || 'Usuario'}</span>
                  <span className="user-role">{usuario?.rol || 'Usuario'}</span>
                </div>
                <i
                  className={`bi bi-chevron-down dropdown-icon ${mostrarMenu ? 'rotate' : ''}`}
                  aria-hidden="true"
                ></i>
              </div>

              {mostrarMenu && (
                <div
                  className="user-menu show"
                  role="menu"
                  aria-label="Opciones de usuario"
                >
                  <div
                    className="menu-item logout-item"
                    onClick={handleCerrarSesion}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCerrarSesion();
                      }
                    }}
                    tabIndex={0}
                    role="menuitem"
                  >
                    <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
                    <span>Cerrar Sesión</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Área de contenido */}
        <main className="content-area" id="main-content">
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
        aria-label={sidebarVisibleMobile ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={sidebarVisibleMobile}
        aria-controls="sidebar-navigation"
      >
        <i
          className={`bi ${sidebarVisibleMobile ? 'bi-x-lg' : 'bi-list'}`}
          aria-hidden="true"
        ></i>
      </button>
    </div>
  );
}

export default PanelPrincipal;