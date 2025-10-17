import React from "react";

const VentasTable = ({
  ventas,
  onEditVenta,
  onDeleteVenta,
  onCancelarVenta,
  onViewDetails,
  onDownloadFactura,
  onDownloadTicket
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
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

  const getFormaPagoBadgeClass = (formaPago) => {
    switch (formaPago) {
      case 'EFECTIVO': return 'bg-success';
      case 'TARJETA': return 'bg-primary';
      case 'MIXTO': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  if (ventas.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="bi bi-receipt display-1 text-muted"></i>
          <h4 className="mt-3">No hay ventas registradas</h4>
          <p className="text-muted">Comienza registrando tu primera venta.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="card-title mb-0">Lista de Ventas</h5>
          <span className="badge bg-primary">{ventas.length} ventas</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>N° Factura</th>
                <th>Cliente</th>
                <th>Sucursal</th>
                <th>Fecha Venta</th>
                <th>Estado</th>
                <th>Forma Pago</th>
                <th>Total</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id}>
                  <td>
                    <strong>{venta.numeroFactura}</strong>
                  </td>
                  <td>{venta.clienteNombre || 'Cliente anónimo'}</td>
                  <td>{venta.sucursalNombre}</td>
                  <td>{formatDate(venta.fechaVenta)}</td>
                  <td>
                    <span className={`badge ${getEstadoBadgeClass(venta.estado)}`}>
                      {venta.estado}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getFormaPagoBadgeClass(venta.formaPago)}`}>
                      {venta.formaPago}
                    </span>
                  </td>
                  <td>
                    <strong>{formatCurrency(venta.total)}</strong>
                  </td>
                  <td className="text-end">
                    <div className="btn-group" role="group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onViewDetails(venta.id)}
                        title="Ver detalles"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      
                      {venta.estado === 'COMPLETADA' && (
                        <>
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => onDownloadFactura(venta.id)}
                            title="Descargar factura"
                          >
                            <i className="bi bi-file-earmark-pdf"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => onDownloadTicket(venta.id)}
                            title="Descargar ticket"
                          >
                            <i className="bi bi-receipt"></i>
                          </button>
                        </>
                      )}
                      
                      {venta.estado === 'PENDIENTE' && (
                        <>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => onEditVenta(venta)}
                            title="Editar venta"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onCancelarVenta(venta.id)}
                            title="Cancelar venta"
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        </>
                      )}
                      
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDeleteVenta(venta.id)}
                        title="Eliminar venta"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VentasTable;