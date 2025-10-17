import React, { useState } from "react";
import ModalRecepcionParcial from "./ModalRecepcionParcial";

const ComprasTable = ({
  compras,
  onEditCompra,
  onDeleteCompra,
  onRecibirCompra,
  onRecibirCompraParcial,
  onCancelarCompra,
  onViewDetails
}) => {
  const [showRecepcionModal, setShowRecepcionModal] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-GT');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'bg-warning text-dark';
      case 'RECIBIDA': return 'bg-success';
      case 'PARCIALMENTE_RECIBIDA': return 'bg-info';
      case 'CANCELADA': return 'bg-danger';
      case 'FACTURADA': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  const calcularPorcentajeRecepcion = (compra) => {
    if (!compra.detalles || compra.detalles.length === 0) return 0;
    
    const totalOrdenado = compra.detalles.reduce((sum, detalle) => 
      sum + (parseFloat(detalle.cantidad) || 0), 0);
    const totalRecibido = compra.detalles.reduce((sum, detalle) => 
      sum + (parseFloat(detalle.cantidadRecibida) || 0), 0);
    
    if (totalOrdenado === 0) return 0;
    return Math.round((totalRecibido / totalOrdenado) * 100);
  };

  const handleRecibirParcial = (compra) => {
    setCompraSeleccionada(compra);
    setShowRecepcionModal(true);
  };

  const handleConfirmarRecepcionParcial = async (detallesRecepcion) => {
    const success = await onRecibirCompraParcial(compraSeleccionada.id, detallesRecepcion);
    if (success) {
      setShowRecepcionModal(false);
      setCompraSeleccionada(null);
    }
  };

  const getCantidadesResumen = (compra) => {
    if (!compra.detalles) return { total: 0, recibido: 0, pendiente: 0 };
    
    const total = compra.detalles.reduce((sum, detalle) => 
      sum + (parseFloat(detalle.cantidad) || 0), 0);
    const recibido = compra.detalles.reduce((sum, detalle) => 
      sum + (parseFloat(detalle.cantidadRecibida) || 0), 0);
    const pendiente = total - recibido;
    
    return { total, recibido, pendiente };
  };

  if (compras.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="bi bi-receipt display-1 text-muted"></i>
          <h4 className="mt-3">No hay compras registradas</h4>
          <p className="text-muted">Comienza registrando tu primera compra.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title mb-0">Lista de Compras</h5>
            <span className="badge bg-primary">{compras.length} compras</span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>N° Factura</th>
                  <th>Proveedor</th>
                  <th>Sucursal</th>
                  <th>Fecha Compra</th>
                  <th>Estado</th>
                  <th>Cantidades</th>
                  <th>Total</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((compra) => {
                  const porcentaje = calcularPorcentajeRecepcion(compra);
                  const cantidades = getCantidadesResumen(compra);
                  
                  return (
                    <tr key={compra.id}>
                      <td>
                        <strong>{compra.numeroFactura}</strong>
                        {compra.numeroControl && (
                          <div><small className="text-muted">Control: {compra.numeroControl}</small></div>
                        )}
                      </td>
                      <td>{compra.proveedorRazonSocial}</td>
                      <td>{compra.sucursalNombre}</td>
                      <td>{formatDate(compra.fechaCompra)}</td>
                      <td>
                        <span className={`badge ${getEstadoBadgeClass(compra.estado)}`}>
                          {compra.estado}
                          {compra.estado === 'PARCIALMENTE_RECIBIDA' && (
                            <small className="ms-1">({porcentaje}%)</small>
                          )}
                        </span>
                        {compra.estado === 'PARCIALMENTE_RECIBIDA' && (
                          <div className="progress mt-1" style={{ height: '4px', width: '80px' }}>
                            <div 
                              className="progress-bar bg-info" 
                              style={{ width: `${porcentaje}%` }}
                            ></div>
                          </div>
                        )}
                      </td>
                      <td>
                        <small>
                          <div>Ordenado: <strong>{cantidades.total.toFixed(2)}</strong></div>
                          <div>Recibido: <strong className="text-success">{cantidades.recibido.toFixed(2)}</strong></div>
                          <div>Pendiente: <strong className="text-warning">{cantidades.pendiente.toFixed(2)}</strong></div>
                        </small>
                      </td>
                      <td>
                        <strong>{formatCurrency(compra.total)}</strong>
                        <div>
                          <small className="text-muted">
                            Sub: {formatCurrency(compra.subtotal)} | 
                            Imp: {formatCurrency(compra.impuesto)} | 
                            Desc: {formatCurrency(compra.descuento)}
                          </small>
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="btn-group" role="group">
                          {/* Botón Ver Detalles - Siempre disponible */}
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => onViewDetails(compra.id)}
                            title="Ver detalles"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          
                          {/* Estados PENDIENTE y PARCIALMENTE_RECIBIDA */}
                          {['PENDIENTE', 'PARCIALMENTE_RECIBIDA'].includes(compra.estado) && (
                            <>
                              {/* Botón Recepción Parcial */}
                              <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() => handleRecibirParcial(compra)}
                                title="Recibir parcialmente"
                              >
                                <i className="bi bi-box-arrow-in-down"></i>
                              </button>
                              
                              {/* Botón Recepción Completa - solo para PENDIENTE */}
                              {compra.estado === 'PENDIENTE' && (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => onRecibirCompra(compra.id)}
                                  title="Recibir compra completa"
                                >
                                  <i className="bi bi-check-circle"></i>
                                </button>
                              )}
                              
                              {/* Editar solo si está PENDIENTE */}
                              {compra.estado === 'PENDIENTE' && (
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => onEditCompra(compra)}
                                  title="Editar compra"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                              )}
                            </>
                          )}
                          
                          {/* Cancelar solo si no está RECIBIDA o CANCELADA */}
                          {!['RECIBIDA', 'CANCELADA'].includes(compra.estado) && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => onCancelarCompra(compra.id)}
                              title="Cancelar compra"
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          )}
                          
                          {/* Eliminar solo si está PENDIENTE o CANCELADA */}
                          {['PENDIENTE', 'CANCELADA'].includes(compra.estado) && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => onDeleteCompra(compra.id)}
                              title="Eliminar compra"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                        
                        {/* Información adicional para compras parcialmente recibidas */}
                        {compra.estado === 'PARCIALMENTE_RECIBIDA' && (
                          <div className="mt-1">
                            <small className="text-info">
                              <i className="bi bi-info-circle me-1"></i>
                              Pendiente: {cantidades.pendiente.toFixed(2)} unidades
                            </small>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Recepción Parcial */}
      {showRecepcionModal && compraSeleccionada && (
        <ModalRecepcionParcial
          compra={compraSeleccionada}
          onSubmit={handleConfirmarRecepcionParcial}
          onCancel={() => {
            setShowRecepcionModal(false);
            setCompraSeleccionada(null);
          }}
        />
      )}
    </>
  );
};

export default ComprasTable;