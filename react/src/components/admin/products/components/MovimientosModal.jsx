import React, { useState, useEffect } from "react";

const MovimientosModal = ({ 
  producto, 
  sucursal, 
  movimientos, 
  onClose, 
  onCargarMovimientos 
}) => {
  const [filtroSucursal, setFiltroSucursal] = useState(sucursal?.id || "TODAS");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [movimientosFiltrados, setMovimientosFiltrados] = useState([]);

  // Cargar movimientos cuando cambien los filtros o el producto
  useEffect(() => {
    if (producto) {
      const sucursalId = filtroSucursal === "TODAS" ? null : parseInt(filtroSucursal);
      onCargarMovimientos(producto.id, sucursalId);
    }
  }, [filtroSucursal, producto]);

  // Aplicar filtros cuando cambien los movimientos o los filtros
  useEffect(() => {
    let filtered = movimientos;
    
    if (filtroTipo !== "TODOS") {
      filtered = filtered.filter(mov => mov.tipoMovimiento === filtroTipo);
    }
    
    setMovimientosFiltrados(filtered);
  }, [movimientos, filtroTipo]);

  const getBadgeClass = (tipoMovimiento) => {
    switch (tipoMovimiento) {
      case 'ENTRADA':
        return 'bg-success';
      case 'SALIDA':
        return 'bg-danger';
      case 'AJUSTE_ENTRADA':
        return 'bg-primary';
      case 'AJUSTE_SALIDA':
        return 'bg-warning text-dark';
      case 'TRASLADO_ENTRADA':
        return 'bg-info text-dark';
      case 'TRASLADO_SALIDA':
        return 'bg-purple';
      default:
        return 'bg-dark';
    }
  };

  const getIconoTipo = (tipoMovimiento) => {
    switch (tipoMovimiento) {
      case 'ENTRADA':
        return 'bi-arrow-down-circle';
      case 'SALIDA':
        return 'bi-arrow-up-circle';
      case 'AJUSTE_ENTRADA':
        return 'bi-plus-circle';
      case 'AJUSTE_SALIDA':
        return 'bi-dash-circle';
      case 'TRASLADO_ENTRADA':
        return 'bi-arrow-left-circle';
      case 'TRASLADO_SALIDA':
        return 'bi-arrow-right-circle';
      default:
        return 'bi-circle';
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDescripcionMovimiento = (movimiento) => {
    switch (movimiento.referenciaTipo) {
      case 'COMPRA':
        return `Compra #${movimiento.referenciaId}`;
      case 'VENTA':
        return `Venta #${movimiento.referenciaId}`;
      case 'AJUSTE':
        return `Ajuste de inventario`;
      case 'TRASLADO':
        return `Traslado entre sucursales`;
      default:
        return movimiento.observaciones || 'Movimiento de inventario';
    }
  };

  const formatTipoMovimiento = (tipo) => {
    const nombres = {
      'ENTRADA': 'Entrada',
      'SALIDA': 'Salida',
      'AJUSTE_ENTRADA': 'Ajuste Entrada',
      'AJUSTE_SALIDA': 'Ajuste Salida',
      'TRASLADO_ENTRADA': 'Traslado Entrada',
      'TRASLADO_SALIDA': 'Traslado Salida'
    };
    return nombres[tipo] || tipo;
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-clock-history me-2"></i>
              Movimientos de Inventario - {producto?.nombreProducto}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Filtros */}
            <div className="row mb-4">
              <div className="col-md-4">
                <label className="form-label">Filtrar por Sucursal</label>
                <select 
                  className="form-select"
                  value={filtroSucursal}
                  onChange={(e) => setFiltroSucursal(e.target.value)}
                >
                  <option value="TODAS">Todas las sucursales</option>
                  {sucursal && (
                    <option value={sucursal.id}>{sucursal.nombreSucursal}</option>
                  )}
                </select>
              </div>
              
              <div className="col-md-4">
                <label className="form-label">Filtrar por Tipo</label>
                <select 
                  className="form-select"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="TODOS">Todos los tipos</option>
                  <option value="ENTRADA">Entradas</option>
                  <option value="SALIDA">Salidas</option>
                  <option value="AJUSTE_ENTRADA">Ajustes Entrada</option>
                  <option value="AJUSTE_SALIDA">Ajustes Salida</option>
                  <option value="TRASLADO_ENTRADA">Traslados Entrada</option>
                  <option value="TRASLADO_SALIDA">Traslados Salida</option>
                </select>
              </div>
              
              <div className="col-md-4 d-flex align-items-end">
                <div className="w-100">
                  <span className="badge bg-light text-dark fs-6">
                    <i className="bi bi-list-check me-1"></i>
                    {movimientosFiltrados.length} movimientos encontrados
                  </span>
                </div>
              </div>
            </div>

            {/* Tabla de movimientos */}
            {movimientosFiltrados.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-muted"></i>
                <h5 className="mt-3 text-muted">No se encontraron movimientos</h5>
                <p className="text-muted">No hay movimientos que coincidan con los filtros seleccionados</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Fecha y Hora</th>
                      <th>Tipo</th>
                      <th className="text-end">Cantidad</th>
                      <th className="text-end">Stock Anterior</th>
                      <th className="text-end">Stock Posterior</th>
                      <th>Sucursal</th>
                      <th>Usuario</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientosFiltrados.map((mov) => (
                      <tr key={mov.id}>
                        <td>
                          <small>{formatFecha(mov.fechaMovimiento)}</small>
                        </td>
                        <td>
                          <span className={`badge ${getBadgeClass(mov.tipoMovimiento)} d-flex align-items-center`} style={{minWidth: '120px'}}>
                            <i className={`bi ${getIconoTipo(mov.tipoMovimiento)} me-1`}></i>
                            {formatTipoMovimiento(mov.tipoMovimiento)}
                          </span>
                        </td>
                        <td className={`text-end fw-bold ${
                          mov.tipoMovimiento === 'ENTRADA' || 
                          mov.tipoMovimiento === 'AJUSTE_ENTRADA' || 
                          mov.tipoMovimiento === 'TRASLADO_ENTRADA' 
                            ? 'text-success' 
                            : 'text-danger'
                        }`}>
                          {mov.cantidad > 0 ? `+${parseFloat(mov.cantidad).toFixed(4)}` : parseFloat(mov.cantidad).toFixed(4)}
                        </td>
                        <td className="text-end">
                          <small>{parseFloat(mov.stockAnterior).toFixed(4)}</small>
                        </td>
                        <td className="text-end">
                          <strong>{parseFloat(mov.stockPosterior).toFixed(4)}</strong>
                        </td>
                        <td>
                          <small>{mov.nombreSucursal}</small>
                        </td>
                        <td>
                          <small>{mov.nombreUsuario}</small>
                        </td>
                        <td className="small">
                          {getDescripcionMovimiento(mov)}
                          {mov.observaciones && (
                            <div className="text-muted mt-1">
                              <em>{mov.observaciones}</em>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <i className="bi bi-x-circle me-2"></i>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovimientosModal;