import React from "react";

const TrasladoDetailsModal = ({ traslado, onClose }) => {
  
  const getEstadoInfo = (estado) => {
    const estados = {
      PENDIENTE: { 
        class: "warning", 
        text: "Pendiente",
        icon: "bi-clock",
        description: "El traslado está pendiente de completar"
      },
      COMPLETADO: { 
        class: "success", 
        text: "Completado",
        icon: "bi-check-circle",
        description: "El traslado se completó exitosamente"
      },
      CANCELADO: { 
        class: "danger", 
        text: "Cancelado",
        icon: "bi-x-circle",
        description: "El traslado fue cancelado"
      },
      RECHAZADO: { 
        class: "secondary", 
        text: "Rechazado",
        icon: "bi-slash-circle",
        description: "El traslado fue rechazado"
      }
    };
    
    return estados[estado] || estados.PENDIENTE;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const estadoInfo = getEstadoInfo(traslado.estado);

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalles del Traslado #{traslado.id}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="detalle-traslado">
              <div className="row mb-4">
                <div className="col-md-6">
                  <p><strong>Estado:</strong> 
                    <span className={`badge bg-${estadoInfo.class} ms-2`}>
                      <i className={`${estadoInfo.icon} me-1`}></i>
                      {estadoInfo.text}
                    </span>
                  </p>
                  <p><strong>Fecha:</strong> {formatFecha(traslado.fechaTraslado)}</p>
                  <p><strong>Creado por:</strong> {traslado.nombreUsuario}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Sucursal Origen:</strong> {traslado.nombreSucursalOrigen}</p>
                  <p><strong>Sucursal Destino:</strong> {traslado.nombreSucursalDestino}</p>
                  {traslado.observaciones && (
                    <p><strong>Observaciones:</strong> {traslado.observaciones}</p>
                  )}
                </div>
              </div>

              <div className="alert alert-info">
                <i className={`${estadoInfo.icon} me-2`}></i>
                {estadoInfo.description}
              </div>

              <hr />
              
              <h6>Productos Trasladados:</h6>
              {traslado.detalles && traslado.detalles.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th>Unidad</th>
                        <th>Cantidad</th>
                        <th>Cantidad en Unidad Base</th>
                      </tr>
                    </thead>
                    <tbody>
                      {traslado.detalles.map((detalle, index) => (
                        <tr key={index}>
                          <td>
                            <div className="producto-info">
                              <div className="fw-medium">{detalle.nombreProducto}</div>
                              {detalle.codigoBarras && (
                                <small className="text-muted">Código: {detalle.codigoBarras}</small>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">
                              {detalle.nombreUnidadMedida} ({detalle.abreviaturaUnidadMedida})
                            </span>
                          </td>
                          <td><strong>{parseFloat(detalle.cantidad).toFixed(4)}</strong></td>
                          <td className="text-muted">{parseFloat(detalle.cantidadEnUnidadBase).toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <td colSpan="2" className="fw-medium">Total:</td>
                        <td className="fw-medium">
                          {traslado.detalles.reduce((sum, detalle) => sum + parseFloat(detalle.cantidad), 0).toFixed(4)}
                        </td>
                        <td className="fw-medium">
                          {traslado.detalles.reduce((sum, detalle) => sum + parseFloat(detalle.cantidadEnUnidadBase), 0).toFixed(4)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay detalles de productos disponibles.</p>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrasladoDetailsModal;