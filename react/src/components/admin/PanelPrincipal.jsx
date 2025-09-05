import React, { useEffect, useState } from "react";
import servicioAutenticacion from "../../services/servicioAutenticacion";
import { useNavigate } from "react-router-dom";
import "./PanelPrincipal.css"; // Archivo CSS separado para los estilos

function PanelPrincipal() {
  const [saludo, setSaludo] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSaludo = async () => {
      try {
        const mensaje = await servicioAutenticacion.obtenerSaludo();
        setSaludo(mensaje);
      } catch (err) {
        setError("Acceso denegado: No se pudo obtener los datos");
        // Limpiar token y redirigir a login si el token es inválido
        localStorage.removeItem('token');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    fetchSaludo();
  }, [navigate]);

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
      <header className="panel-header">
        <h1 className="panel-title">{saludo}</h1>
        <p className="panel-subtitle">Bienvenido al sistema POS de El Hogar</p>
      </header>

      <div className="modules-section">
        <h2 className="modules-title">Módulos del sistema</h2>
        <div className="row g-4 modules-grid">
          <div className="col-md-6 col-lg-4">
            <div className="card module-card h-100" onClick={() => navigate('/usuarios')}>
              <div className="card-body text-center">
                <div className="module-icon mb-3">
                  <i className="bi bi-people-fill"></i>
                </div>
                <h3 className="card-title">Gestión de Usuarios</h3>
                <p className="card-text">Administra usuarios y permisos del sistema</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card module-card h-100" onClick={() => navigate('/sucursales')}>
              <div className="card-body text-center">
                <div className="module-icon mb-3">
                  <i className="bi bi-shop"></i>
                </div>
                <h3 className="card-title">Sucursales</h3>
                <p className="card-text">Gestiona múltiples puntos de venta</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card module-card h-100" onClick={() => navigate('/roles')}>
              <div className="card-body text-center">
                <div className="module-icon mb-3">
                  <i className="bi bi-shield-lock"></i>
                </div>
                <h3 className="card-title">Roles y Permisos</h3>
                <p className="card-text">Controla accesos y privilegios</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card module-card h-100" onClick={() => navigate('/inventario')}>
              <div className="card-body text-center">
                <div className="module-icon mb-3">
                  <i className="bi bi-boxes"></i>
                </div>
                <h3 className="card-title">Inventario</h3>
                <p className="card-text">Gestiona productos y existencias</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card module-card h-100" onClick={() => navigate('/ventas')}>
              <div className="card-body text-center">
                <div className="module-icon mb-3">
                  <i className="bi bi-cash-coin"></i>
                </div>
                <h3 className="card-title">Punto de Venta</h3>
                <p className="card-text">Procesa transacciones y ventas</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card module-card h-100" onClick={() => navigate('/reportes')}>
              <div className="card-body text-center">
                <div className="module-icon mb-3">
                  <i className="bi bi-bar-chart-fill"></i>
                </div>
                <h3 className="card-title">Reportes</h3>
                <p className="card-text">Genera análisis y estadísticas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="panel-footer mt-5">
        <p className="text-center text-muted">El Hogar © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default PanelPrincipal;