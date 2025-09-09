import React, { useEffect, useState } from "react";
import servicioAutenticacion from "../../services/servicioAutenticacion";
import { useNavigate } from "react-router-dom";
import "./PanelPrincipal.css";

function PanelPrincipal() {
  const [saludo, setSaludo] = useState("");
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const navigate = useNavigate();

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

  const handleCerrarSesion = () => {
    // Eliminar token del localStorage
    localStorage.removeItem('token');
    // Redirigir al login
    navigate('/login');
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
    <div className="panel-container">
      {/* Header con navegación */}
      <header className="panel-header">
        <div className="header-content">
          <div className="brand-section">
            <i className="bi bi-cash-register brand-logo"></i>
            <div className="brand-text">
              <h1 className="panel-title">El Hogar</h1>
              <p className="panel-subtitle">Sistema POS</p>
            </div>
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
              <div className="user-menu">
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

      {/* Contenido principal */}
      <main className="panel-main">
        <div className="welcome-section">
          <h2 className="welcome-title">{saludo}</h2>
          <p className="welcome-subtitle">Bienvenido al sistema POS de El Hogar</p>
        </div>

        <div className="modules-section">
          <h2 className="modules-title">Módulos del sistema</h2>
          <div className="modules-grid">
            <div className="module-card" onClick={() => navigate('/usuarios')}>
              <div className="module-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <div className="module-content">
                <h3 className="module-name">Gestión de Usuarios</h3>
                <p className="module-description">Administra usuarios y permisos del sistema</p>
              </div>
            </div>

            <div className="module-card" onClick={() => navigate('/sucursales')}>
              <div className="module-icon">
                <i className="bi bi-shop"></i>
              </div>
              <div className="module-content">
                <h3 className="module-name">Sucursales</h3>
                <p className="module-description">Gestiona múltiples puntos de venta</p>
              </div>
            </div>

            <div className="module-card" onClick={() => navigate('/roles')}>
              <div className="module-icon">
                <i className="bi bi-shield-lock"></i>
              </div>
              <div className="module-content">
                <h3 className="module-name">Roles y Permisos</h3>
                <p className="module-description">Controla accesos y privilegios</p>
              </div>
            </div>

            <div className="module-card" onClick={() => navigate('/inventario')}>
              <div className="module-icon">
                <i className="bi bi-boxes"></i>
              </div>
              <div className="module-content">
                <h3 className="module-name">Inventario</h3>
                <p className="module-description">Gestiona productos y existencias</p>
              </div>
            </div>

            <div className="module-card" onClick={() => navigate('/ventas')}>
              <div className="module-icon">
                <i className="bi bi-cash-coin"></i>
              </div>
              <div className="module-content">
                <h3 className="module-name">Punto de Venta</h3>
                <p className="module-description">Procesa transacciones y ventas</p>
              </div>
            </div>

            <div className="module-card" onClick={() => navigate('/reportes')}>
              <div className="module-icon">
                <i className="bi bi-bar-chart-fill"></i>
              </div>
              <div className="module-content">
                <h3 className="module-name">Reportes</h3>
                <p className="module-description">Genera análisis y estadísticas</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="panel-footer">
        <p className="footer-text">El Hogar © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default PanelPrincipal;