import React, { useState } from "react";

const VentaDetailsModal = ({ venta, onClose, onCancelarVenta, onDownloadFactura, onDownloadTicket }) => {
  const [activeTab, setActiveTab] = useState("info");

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      case 'COMPLETADA': return 'bg-success';
      case 'CANCELADA': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  if (!venta) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-light">
            <h5 className="modal-title">
              <i className="bi bi-receipt me-2"></i>
              Detalles de la Venta
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
            ></button>
          </div>
          
          <div className="modal-body">
            {/* Información del encabezado */}
            <div className="row mb-4">
              <div className="col-md-8">
                <h4 className="text-primary">Factura: {venta.numeroFactura}</h4>
                <p className="mb-1">
                  <strong>Cliente:</strong> {venta.clienteNombre || 'Cliente anónimo'}
                </p>
                <p className="mb-1">
                  <strong>Sucursal:</strong> {venta.sucursalNombre}
                </p>
                <p className="mb-1">
                  <strong>Vendedor:</strong> {venta.usuarioNombre}
                </p>
                <p className="mb-0">
                  <strong>Estado:</strong>{" "}
                  <span className={`badge ${getEstadoBadgeClass(venta.estado)}`}>
                    {venta.estado}
                  </span>
                </p>
              </div>
              <div className="col-md-4 text-end">
                <div className="text-muted">
                  <small>
                    <strong>Fecha de Venta:</strong> {formatDate(venta.fechaVenta)}
                  </small>
                </div>
                <div className="text-muted">
                  <small>
                    <strong>Forma de Pago:</strong> {venta.formaPago}
                  </small>
                </div>
                <div className="text-muted">
                  <small>
                    <strong>Tipo de Venta:</strong> {venta.tipoVenta}
                  </small>
                </div>
                {venta.stripeSessionId && (
                  <div className="text-muted">
                    <small>
                      <strong>Stripe Session:</strong> {venta.stripeSessionId}
                    </small>
                  </div>
                )}
              </div>
            </div>

            {/* Pestañas */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  <i className="bi bi-info-circle me-2"></i>
                  Información General
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'detalles' ? 'active' : ''}`}
                  onClick={() => setActiveTab('detalles')}
                >
                  <i className="bi bi-list-ul me-2"></i>
                  Detalles de Productos
                  <span className="badge bg-primary ms-2">{venta.detalles?.length || 0}</span>
                </button>
              </li>
            </ul>

            {/* Contenido de pestañas */}
            <div className="tab-content">
              {/* Pestaña de Información General */}
              {activeTab === 'info' && (
                <div className="row">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="card-title mb-0">
                          <i className="bi bi-currency-dollar me-2"></i>
                          Información Financiera
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <span>Subtotal:</span>
                          <strong>{formatCurrency(venta.subtotal)}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Impuesto:</span>
                          <strong>{formatCurrency(venta.impuesto)}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Descuento:</span>
                          <strong>{formatCurrency(venta.descuento)}</strong>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <span><strong>Total:</strong></span>
                          <strong className="text-primary">{formatCurrency(venta.total)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="card-title mb-0">
                          <i className="bi bi-chat-text me-2"></i>
                          Observaciones
                        </h6>
                      </div>
                      <div className="card-body">
                        <p className="mb-0">
                          {venta.observaciones || "No hay observaciones registradas."}
                        </p>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="card mt-3">
                      <div className="card-header bg-light">
                        <h6 className="card-title mb-0">
                          <i className="bi bi-lightning me-2"></i>
                          Acciones
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="d-grid gap-2">
                          {venta.estado === 'COMPLETADA' && (
                            <>
                              <button
                                className="btn btn-info"
                                onClick={() => onDownloadFactura(venta.id)}
                              >
                                <i className="bi bi-file-earmark-pdf me-2"></i>
                                Descargar Factura PDF
                              </button>
                              <button
                                className="btn btn-secondary"
                                onClick={() => onDownloadTicket(venta.id)}
                              >
                                <i className="bi bi-receipt me-2"></i>
                                Descargar Ticket PDF
                              </button>
                            </>
                          )}
                          
                          {venta.estado === 'PENDIENTE' && (
                            <button
                              className="btn btn-danger"
                              onClick={() => onCancelarVenta(venta.id)}
                            >
                              <i className="bi bi-x-circle me-2"></i>
                              Cancelar Venta
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pestaña de Detalles de Productos */}
              {activeTab === 'detalles' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6>Productos en la Venta</h6>
                    <span className="badge bg-primary">
                      {venta.detalles?.length || 0} productos
                    </span>
                  </div>

                  {!venta.detalles || venta.detalles.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-inbox display-4 text-muted"></i>
                      <h5 className="mt-3 text-muted">No hay productos</h5>
                      <p className="text-muted">No se encontraron productos en esta venta.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover table-sm">
                        <thead className="table-light">
                          <tr>
                            <th>Producto</th>
                            <th>Unidad Medida</th>
                            <th>Cantidad</th>
                            <th>Precio Unitario</th>
                            <th>Subtotal</th>
                            <th>Impuesto</th>
                            <th>Descuento</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {venta.detalles.map((detalle) => (
                            <tr key={detalle.id}>
                              <td>
                                <strong>{detalle.productoNombre}</strong>
                                <div>
                                  <small className="text-muted">
                                    Cód: {detalle.codigoBarras}
                                  </small>
                                </div>
                              </td>
                              <td>{detalle.unidadMedidaAbreviatura}</td>
                              <td>{detalle.cantidad}</td>
                              <td>{formatCurrency(detalle.precioUnitario)}</td>
                              <td>{formatCurrency(detalle.subtotal)}</td>
                              <td>{formatCurrency(detalle.impuesto)}</td>
                              <td>{formatCurrency(detalle.descuento)}</td>
                              <td>
                                <strong>{formatCurrency(detalle.total)}</strong>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentaDetailsModal;