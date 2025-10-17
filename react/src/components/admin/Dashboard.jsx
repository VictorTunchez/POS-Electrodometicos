import React, { useEffect, useState } from 'react';
import servicioDashboard from '../../services/servicioDashboard';
import './Dashboard.css';

function Dashboard() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Función para convertir string formateado a número para cálculos
  const parsearMoneda = (valor) => {
    if (typeof valor === 'number') return valor;
    if (typeof valor !== 'string') return 0;
    return parseFloat(valor.replace(/,/g, ''));
  };

  // Función para formatear números enteros
  const formatoEntero = (valor) => {
    if (valor === null || valor === undefined) return '0';
    return new Intl.NumberFormat('es-GT').format(valor);
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      const datos = await servicioDashboard.obtenerEstadisticasDashboard();
      setEstadisticas(datos);
    } catch (err) {
      setError('Error al cargar las estadísticas');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleDescargarReporte = async (tipo) => {
    try {
      const blob = await servicioDashboard.descargarReporte(tipo);
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-${tipo}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar reporte:', err);
      alert('Error al descargar el reporte');
    }
  };

  // Calcular porcentaje para la barra de progreso
  const calcularPorcentajeMeta = () => {
    if (!estadisticas) return 0;
    const ventas = parsearMoneda(estadisticas.ventasHoy);
    const meta = parsearMoneda(estadisticas.metaVentas);
    if (meta === 0) return 0;
    return Math.min((ventas / meta) * 100, 100);
  };

  if (cargando) {
    return (
      <div className="dashboard-cargando">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">
          <i className="bi bi-exclamation-triangle"></i>
        </div>
        <h3>{error}</h3>
        <button className="btn btn-primary" onClick={cargarEstadisticas}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header con título */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard Principal</h1>
          <p>Resumen general del sistema POS</p>
        </div>
        <div className="dashboard-actions">
          <button 
            className="btn btn-outline-primary"
            onClick={() => handleDescargarReporte('general')}
          >
            <i className="bi bi-file-earmark-pdf"></i> Descargar Reporte
          </button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="metricas-grid">
        <div className="metrica-card ventas">
          <div className="metrica-icon">
            <i className="bi bi-currency-dollar"></i>
          </div>
          <div className="metrica-info">
            <h3>Q{estadisticas?.ventasHoy || '0.00'}</h3>
            <p>Ventas Hoy</p>
            <div className="metrica-detalle">
              <span className={`tendencia ${estadisticas?.tendenciaVentas >= 0 ? 'positiva' : 'negativa'}`}>
                <i className={`bi bi-arrow-${estadisticas?.tendenciaVentas >= 0 ? 'up' : 'down'}`}></i>
                {Math.abs(estadisticas?.tendenciaVentas || 0)}%
              </span>
              <span className="contador-ventas">
                {formatoEntero(estadisticas?.ventasHoyCount)} transacciones
              </span>
            </div>
          </div>
        </div>

        <div className="metrica-card clientes">
          <div className="metrica-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="metrica-info">
            <h3>{formatoEntero(estadisticas?.totalClientes)}</h3>
            <p>Total Clientes</p>
            <span className="tendencia positiva">
              <i className="bi bi-arrow-up"></i>
              +{formatoEntero(estadisticas?.clientesNuevosMes)} este mes
            </span>
          </div>
        </div>

        <div className="metrica-card productos">
          <div className="metrica-icon">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="metrica-info">
            <h3>{formatoEntero(estadisticas?.totalProductos)}</h3>
            <p>Productos Activos</p>
            <span className={`stock ${estadisticas?.stockBajo > 0 ? 'alerta' : 'normal'}`}>
              <i className="bi bi-exclamation-triangle"></i>
              {formatoEntero(estadisticas?.stockBajo)} con stock bajo
            </span>
          </div>
        </div>

        <div className="metrica-card compras">
          <div className="metrica-icon">
            <i className="bi bi-cart-plus"></i>
          </div>
          <div className="metrica-info">
            <h3>Q{estadisticas?.comprasMes || '0.00'}</h3>
            <p>Compras del Mes</p>
            <span className="tendencia info">
              <i className="bi bi-calendar-check"></i>
              Última: {estadisticas?.ultimaCompra || 'N/A'}
            </span>
          </div>
        </div>

        {/* Nueva métrica para sucursales */}
        <div className="metrica-card sucursales">
          <div className="metrica-icon">
            <i className="bi bi-shop"></i>
          </div>
          <div className="metrica-info">
            <h3>{formatoEntero(estadisticas?.totalSucursales)}</h3>
            <p>Sucursales Activas</p>
            <span className="tendencia info">
              <i className="bi bi-building"></i>
              Puntos de venta
            </span>
          </div>
        </div>
      </div>

      {/* Secciones de contenido */}
      <div className="dashboard-grid">
        {/* Sección de productos populares */}
        <div className="productos-section">
          <div className="section-header">
            <h3>
              <i className="bi bi-trophy"></i>
              Productos Más Vendidos
            </h3>
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleDescargarReporte('productos')}
            >
              <i className="bi bi-download"></i> PDF
            </button>
          </div>
          <div className="productos-lista">
            {estadisticas?.productosPopulares?.map((producto, index) => (
              <div key={index} className="producto-item">
                <div className="producto-rank">
                  <span className={`rank-badge ${index < 3 ? 'top' : ''}`}>
                    #{index + 1}
                  </span>
                </div>
                <div className="producto-info">
                  <span className="producto-nombre">{producto.nombre}</span>
                  <span className="producto-vendidos">
                    <i className="bi bi-cart-check"></i>
                    {producto.vendidos} unidades
                  </span>
                </div>
                <div className="producto-ganancia">
                  <span className="ganancia-text">Q{producto.ganancia}</span>
                  <span className="ganancia-label">Ganancia</span>
                </div>
              </div>
            )) || (
              <div className="sin-datos">
                <i className="bi bi-inbox"></i>
                <p>No hay datos de productos populares</p>
              </div>
            )}
          </div>
        </div>

        {/* Sección de alertas y métricas */}
        <div className="alertas-section">
          <div className="section-header">
            <h3>
              <i className="bi bi-bell"></i>
              Alertas y Métricas
            </h3>
          </div>
          <div className="alertas-lista">
            {/* Progreso de meta de ventas */}
            <div className="meta-ventas-card">
              <div className="meta-header">
                <span className="meta-title">Progreso Meta Mensual</span>
                <span className="meta-valor">Q{estadisticas?.ventasHoy || '0.00'} / Q{estadisticas?.metaVentas || '0.00'}</span>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${calcularPorcentajeMeta()}%` 
                  }}
                ></div>
              </div>
              <div className="meta-footer">
                <span className="meta-porcentaje">
                  {Math.round(calcularPorcentajeMeta())}% completado
                </span>
              </div>
            </div>

            {/* Alertas del sistema */}
            <div className="alertas-lista-interna">
              {estadisticas?.stockBajo > 0 && (
                <div className="alerta-item alerta">
                  <i className="bi bi-exclamation-triangle"></i>
                  <div className="alerta-content">
                    <strong>{formatoEntero(estadisticas.stockBajo)} productos</strong> con stock bajo
                    <small>Revisar inventario urgentemente</small>
                  </div>
                </div>
              )}
              
              <div className="alerta-item info">
                <i className="bi bi-graph-up"></i>
                <div className="alerta-content">
                  <strong>Tendencia de ventas:</strong> {estadisticas?.tendenciaVentas || 0}%
                  <small>Comparado con el mes anterior</small>
                </div>
              </div>

              <div className="alerta-item exito">
                <i className="bi bi-cart-check"></i>
                <div className="alerta-content">
                  <strong>{formatoEntero(estadisticas?.ventasHoyCount)} ventas</strong> realizadas hoy
                  <small>Total: Q{estadisticas?.ventasHoy || '0.00'}</small>
                </div>
              </div>

              <div className="alerta-item info">
                <i className="bi bi-person-plus"></i>
                <div className="alerta-content">
                  <strong>{formatoEntero(estadisticas?.clientesNuevosMes)} clientes nuevos</strong> este mes
                  <small>Total: {formatoEntero(estadisticas?.totalClientes)} clientes</small>
                </div>
              </div>

              <div className="alerta-item info">
                <i className="bi bi-shop"></i>
                <div className="alerta-content">
                  <strong>{formatoEntero(estadisticas?.totalSucursales)} sucursales</strong> activas
                  <small>Puntos de venta en operación</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de ventas por sucursal */}
        {estadisticas?.ventasPorSucursal && estadisticas.ventasPorSucursal.length > 0 && (
          <div className="grafica-section">
            <div className="section-header">
              <h3>
                <i className="bi bi-pie-chart"></i>
                Ventas por Sucursal
              </h3>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleDescargarReporte('sucursales')}
              >
                <i className="bi bi-download"></i> PDF
              </button>
            </div>
            <div className="sucursales-lista">
              {estadisticas.ventasPorSucursal.map((sucursal, index) => (
                <div key={index} className="sucursal-item">
                  <div className="sucursal-info">
                    <h4>{sucursal.nombre}</h4>
                    <span className="sucursal-porcentaje">{sucursal.porcentaje}% del total</span>
                  </div>
                  <div className="sucursal-stats">
                    <div className="sucursal-stat">
                      <span className="sucursal-ventas">Q{sucursal.ventas}</span>
                      <span className="sucursal-label">Ventas</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sección de gráficas placeholder */}
        <div className="grafica-section">
          <div className="section-header">
            <h3>
              <i className="bi bi-bar-chart"></i>
              Métricas Visuales
            </h3>
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleDescargarReporte('ventas')}
            >
              <i className="bi bi-download"></i> PDF
            </button>
          </div>
          <div className="graficas-container">
            <div className="grafica-placeholder">
              <div className="placeholder-icon">
                <i className="bi bi-pie-chart"></i>
              </div>
              <div className="placeholder-content">
                <h4>Análisis de Ventas</h4>
                <p>Próximamente: Gráficas interactivas con Chart.js</p>
                <div className="placeholder-stats">
                  <div className="stat-item">
                    <span className="stat-value">Q{estadisticas?.ventasHoy || '0.00'}</span>
                    <span className="stat-label">Ventas Hoy</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{estadisticas?.tendenciaVentas || 0}%</span>
                    <span className="stat-label">Crecimiento</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="quick-stats">
              <div className="quick-stat">
                <i className="bi bi-arrow-up-circle text-success"></i>
                <div>
                  <span className="stat-number">{formatoEntero(estadisticas?.clientesNuevosMes)}</span>
                  <span className="stat-desc">Clientes Nuevos</span>
                </div>
              </div>
              <div className="quick-stat">
                <i className="bi bi-box-seam text-warning"></i>
                <div>
                  <span className="stat-number">{formatoEntero(estadisticas?.stockBajo)}</span>
                  <span className="stat-desc">Stock Bajo</span>
                </div>
              </div>
              <div className="quick-stat">
                <i className="bi bi-cart-check text-primary"></i>
                <div>
                  <span className="stat-number">{formatoEntero(estadisticas?.ventasHoyCount)}</span>
                  <span className="stat-desc">Ventas Hoy</span>
                </div>
              </div>
              <div className="quick-stat">
                <i className="bi bi-shop text-info"></i>
                <div>
                  <span className="stat-number">{formatoEntero(estadisticas?.totalSucursales)}</span>
                  <span className="stat-desc">Sucursales</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;