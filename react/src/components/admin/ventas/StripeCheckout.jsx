import React from 'react';

const StripeCheckout = ({ 
  venta, 
  onSuccess, 
  onCancel, 
  onError 
}) => {
  const handleCheckout = () => {
    if (!venta?.stripeSessionUrl) {
      onError('No hay URL de checkout disponible');
      return;
    }

    // Redirigir a Stripe Checkout
    window.location.href = venta.stripeSessionUrl;
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-light">
            <h5 className="modal-title">
              <i className="bi bi-credit-card me-2"></i>
              Pago con Tarjeta - Stripe
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onCancel}
            ></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Serás redirigido a la plataforma segura de Stripe para completar el pago.
            </div>
            
            <div className="card mb-3">
              <div className="card-body">
                <h6>Resumen de la Venta</h6>
                <div className="d-flex justify-content-between">
                  <span>Número de Factura:</span>
                  <strong>{venta.numeroFactura}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Total:</span>
                  <strong>Q {venta.total?.toFixed(2)}</strong>
                </div>
              </div>
            </div>
            
            <div className="d-grid gap-2">
              <button
                className="btn btn-primary"
                onClick={handleCheckout}
              >
                <i className="bi bi-credit-card me-2"></i>
                Proceder al Pago con Tarjeta
              </button>
              
              <button
                className="btn btn-outline-secondary"
                onClick={onCancel}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;