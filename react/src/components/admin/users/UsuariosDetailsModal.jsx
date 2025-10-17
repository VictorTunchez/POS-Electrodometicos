import React from "react";

function UsuariosDetailsModal({ selectedUsuario, setShowDetailsModal, setSelectedUsuario }) {
  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-person me-2"></i>
              Detalles del Usuario
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedUsuario(null);
              }}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="detail-item mb-3">
                  <label className="form-label fw-bold text-muted mb-1">Nombre Completo</label>
                  <p className="fs-5 text-primary mb-0">{selectedUsuario.nombre} {selectedUsuario.apellido}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="detail-item mb-3">
                  <label className="form-label fw-bold text-muted mb-1">Estado</label>
                  <p className="mb-0">
                    <span className={`badge ${selectedUsuario.activo ? 'bg-success' : 'bg-danger'}`}>
                      {selectedUsuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="col-12">
                <div className="detail-item">
                  <label className="form-label fw-bold text-muted mb-1">Email</label>
                  <p className="mb-0">{selectedUsuario.email}</p>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <div className="detail-item">
                  <label className="form-label fw-bold text-muted mb-1">Rol</label>
                  <p className="mb-0">
                    <span className="badge bg-info">{selectedUsuario.rolNombre}</span>
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="detail-item">
                  <label className="form-label fw-bold text-muted mb-1">Sucursal</label>
                  <p className="mb-0">
                    {selectedUsuario.sucursalNombre || 
                     <span className="text-muted">Sin sucursal asignada</span>}
                  </p>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <div className="detail-item">
                  <label className="form-label fw-bold text-muted mb-1">Fecha de Creación</label>
                  <p className="mb-0">
                    {new Date(selectedUsuario.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="detail-item">
                  <label className="form-label fw-bold text-muted mb-1">Última Actualización</label>
                  <p className="mb-0">
                    {new Date(selectedUsuario.updatedAt).toLocaleDateString('es-ES', {
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

            {!selectedUsuario.activo && selectedUsuario.deletedAt && (
              <div className="alert alert-warning">
                <h6>
                  <i className="bi bi-info-circle me-2"></i>
                  Información de Eliminación
                </h6>
                <div className="detail-item">
                  <label className="form-label fw-bold text-muted mb-1">Fecha de Eliminación</label>
                  <p className="mb-0">
                    {new Date(selectedUsuario.deletedAt).toLocaleDateString('es-ES', {
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
                setSelectedUsuario(null);
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

export default UsuariosDetailsModal;