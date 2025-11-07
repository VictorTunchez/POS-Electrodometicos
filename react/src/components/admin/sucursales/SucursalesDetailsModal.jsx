import React from "react";

function SucursalesDetailsModal({ selectedSucursal, setShowDetailsModal, setSelectedSucursal }) {
  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-shop me-2"></i>
              Detalles de la Sucursal
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedSucursal(null);
              }}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="detail-item mb-3">
                  <label className="form-label fw-bold text-muted mb-1">Nombre de la Sucursal</label>
                  <p className="fs-5 text-primary mb-0">{selectedSucursal.nombreSucursal}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="detail-item mb-3">
                  <label className="form-label fw-bold text-muted mb-1">Estado</label>
                  <p className="mb-0">
                    <span className={`badge ${selectedSucursal.activo ? 'bg-success' : 'bg-danger'}`}>
                      {selectedSucursal.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="col-12">
                <div className="detail-item">
                  <label className="form-label fw-bold text-muted mb-1">Dirección</label>
                  <p className="mb-0">{selectedSucursal.direccion}</p>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <div className="detail-item">
                  <label className="form-label fw-bold text-muted mb-1">Teléfono</label>
                  <p className="mb-0">{selectedSucursal.telefono}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="detail-item">
                  <label className="form-label fw-bold text-muted mb-1">Fecha de Creación</label>
                  <p className="mb-0">
                    {new Date(selectedSucursal.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="detail-item">
                  <label className="form-label fw-bold text-muted mb-1">Última Actualización</label>
                  <p className="mb-0">
                    {new Date(selectedSucursal.updatedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {!selectedSucursal.activo && selectedSucursal.deletedAt && (
              <div className="alert alert-warning mt-4">
                <h6>
                  <i className="bi bi-info-circle me-2"></i>
                  Información de Eliminación
                </h6>
                <div className="detail-item">
                  <label className="form-label fw-bold text-muted mb-1">Fecha de Eliminación</label>
                  <p className="mb-0">
                    {new Date(selectedSucursal.deletedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedSucursal(null);
              }}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SucursalesDetailsModal;