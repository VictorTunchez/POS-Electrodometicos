import React from 'react';

const ConfirmacionVentaModal = ({ 
  venta, 
  onClose, 
  onDownloadFactura, 
  onDownloadTicket 
}) => {
  if (!venta) return null;

  const handleDownloadFactura = () => {
    onDownloadFactura(venta.id);
    // onClose();
  };

  const handleDownloadTicket = () => {
    onDownloadTicket(venta.id);
    // onClose();
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">
              <i className="bi bi-check-circle me-2"></i>
              Venta Registrada Exitosamente
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="text-center mb-4">
              <i className="bi bi-check-circle-fill text-success display-1"></i>
              <h4 className="mt-3">¡Venta Completada!</h4>
              <p className="text-muted">La venta se ha registrado correctamente.</p>
            </div>
            
            <div className="venta-resumen">
              <h6>Resumen de la Venta</h6>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <span>Número de Factura:</span>
                  <strong>{venta.numeroFactura}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Cliente:</span>
                  <strong>{venta.clienteNombre || 'Consumidor final'}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Total:</span>
                  <strong>Q {venta.total?.toFixed(2)}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Forma de Pago:</span>
                  <strong>{venta.formaPago}</strong>
                </li>
              </ul>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={onClose}
            >
              Cerrar
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleDownloadFactura}
            >
              <i className="bi bi-file-earmark-pdf me-2"></i> Descargar Factura
            </button>
            <button 
              type="button" 
              className="btn btn-info"
              onClick={handleDownloadTicket}
            >
              <i className="bi bi-receipt me-2"></i> Descargar Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionVentaModal;