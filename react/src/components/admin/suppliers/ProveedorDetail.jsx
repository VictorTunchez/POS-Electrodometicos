import React, { useState, useEffect } from "react";

const ProveedorDetailsModal = ({ proveedor, onClose }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [loadingCompras, setLoadingCompras] = useState(false);

  useEffect(() => {
    if (proveedor && activeTab === "compras" && proveedor.compras) {
      // Las compras ya vienen cargadas desde el componente principal
      setLoadingCompras(false);
    }
  }, [proveedor, activeTab]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$ 0';
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG'
    }).format(amount);
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE': return 'bg-warning text-dark';
      case 'RECIBIDA': return 'bg-success';
      case 'PARCIALMENTE_RECIBIDA': return 'bg-info';
      case 'CANCELADA': return 'bg-danger';
      case 'FACTURADA': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  if (!proveedor) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-light">
            <h5 className="modal-title">
              <i className="bi bi-building me-2"></i>
              Detalles del Proveedor
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
                <h4 className="text-primary">{proveedor.razonSocial}</h4>
                {proveedor.nombreComercial && (
                  <p className="text-muted mb-1">
                    <strong>Nombre Comercial:</strong> {proveedor.nombreComercial}
                  </p>
                )}
                <p className="mb-1">
                  <strong>NIT:</strong> {proveedor.nit}
                </p>
                <p className="mb-0">
                  <strong>Estado:</strong>{" "}
                  <span className={`badge ${proveedor.activo ? 'bg-success' : 'bg-danger'}`}>
                    {proveedor.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
              </div>
              <div className="col-md-4 text-end">
                <div className="text-muted">
                  <small>
                    <strong>Registrado:</strong> {formatDate(proveedor.createdAt)}
                  </small>
                </div>
                {proveedor.updatedAt && (
                  <div className="text-muted">
                    <small>
                      <strong>Actualizado:</strong> {formatDate(proveedor.updatedAt)}
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
                  className={`nav-link ${activeTab === 'compras' ? 'active' : ''}`}
                  onClick={() => setActiveTab('compras')}
                >
                  <i className="bi bi-receipt me-2"></i>
                  Historial de Compras
                  {proveedor.compras && (
                    <span className="badge bg-primary ms-2">{proveedor.compras.length}</span>
                  )}
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
                          <i className="bi bi-telephone me-2"></i>
                          Información de Contacto
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <strong>Teléfono:</strong>
                          <div>{proveedor.telefono || 'No especificado'}</div>
                        </div>
                        <div className="mb-3">
                          <strong>Email:</strong>
                          <div>{proveedor.email || 'No especificado'}</div>
                        </div>
                        <div className="mb-3">
                          <strong>Dirección:</strong>
                          <div>{proveedor.direccion || 'No especificada'}</div>
                        </div>
                        <div>
                          <strong>Ubicación:</strong>
                          <div>
                            {proveedor.departamento && proveedor.municipio 
                              ? `${proveedor.departamento}, ${proveedor.municipio}`
                              : proveedor.departamento || proveedor.municipio || 'No especificada'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="card-title mb-0">
                          <i className="bi bi-person me-2"></i>
                          Persona de Contacto
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <strong>Nombre:</strong>
                          <div>{proveedor.contactoNombre || 'No especificado'}</div>
                        </div>
                        <div>
                          <strong>Teléfono:</strong>
                          <div>{proveedor.contactoTelefono || 'No especificado'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {proveedor.observaciones && (
                    <div className="col-12 mt-3">
                      <div className="card">
                        <div className="card-header bg-light">
                          <h6 className="card-title mb-0">
                            <i className="bi bi-chat-text me-2"></i>
                            Observaciones
                          </h6>
                        </div>
                        <div className="card-body">
                          <p className="mb-0">{proveedor.observaciones}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pestaña de Compras */}
              {activeTab === 'compras' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6>Historial de Compras</h6>
                    {proveedor.compras && (
                      <span className="badge bg-primary">
                        {proveedor.compras.length} compras
                      </span>
                    )}
                  </div>

                  {loadingCompras ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      <p className="mt-2 text-muted">Cargando compras...</p>
                    </div>
                  ) : !proveedor.compras || proveedor.compras.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-receipt display-4 text-muted"></i>
                      <h5 className="mt-3 text-muted">No hay compras registradas</h5>
                      <p className="text-muted">No se encontraron compras para este proveedor.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover table-sm">
                        <thead className="table-light">
                          <tr>
                            <th>N° Factura</th>
                            <th>Fecha Compra</th>
                            <th>Sucursal</th>
                            <th>Estado</th>
                            <th>Total</th>
                            <th>Detalles</th>
                          </tr>
                        </thead>
                        <tbody>
                          {proveedor.compras.map((compra) => (
                            <tr key={compra.id}>
                              <td>
                                <strong>{compra.numeroFactura || 'N/A'}</strong>
                                {compra.numeroControl && (
                                  <div>
                                    <small className="text-muted">
                                      Control: {compra.numeroControl}
                                    </small>
                                  </div>
                                )}
                              </td>
                              <td>{formatDate(compra.fechaCompra)}</td>
                              <td>{compra.sucursalNombre || 'N/A'}</td>
                              <td>
                                <span className={`badge ${getEstadoBadgeClass(compra.estado)}`}>
                                  {compra.estado || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <strong>{formatCurrency(compra.total)}</strong>
                                {(compra.subtotal || compra.impuesto || compra.descuento) && (
                                  <div>
                                    <small className="text-muted">
                                      {compra.subtotal && `Sub: ${formatCurrency(compra.subtotal)}`}
                                      {compra.impuesto && ` | Imp: ${formatCurrency(compra.impuesto)}`}
                                      {compra.descuento && ` | Desc: ${formatCurrency(compra.descuento)}`}
                                    </small>
                                  </div>
                                )}
                              </td>
                              <td>
                                <small>
                                  {compra.detalles?.length || 0} productos
                                </small>
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

export default ProveedorDetailsModal;