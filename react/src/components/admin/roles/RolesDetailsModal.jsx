import React from "react";

function RolesDetailsModal({ selectedRol, setShowDetailsModal, setSelectedRol }) {
  // Agrupar permisos por categoría
  const permisosPorCategoria = selectedRol.permisos.reduce((acc, permiso) => {
    if (!acc[permiso.categoria]) {
      acc[permiso.categoria] = [];
    }
    acc[permiso.categoria].push(permiso);
    return acc;
  }, {});

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-shield me-2"></i>
              Detalles del Rol
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedRol(null);
              }}
            ></button>
          </div>
          <div className="modal-body">
            {/* Información básica */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="detail-item mb-3">
                  <label className="form-label fw-bold text-muted mb-1">Nombre del Rol</label>
                  <p className="fs-5 text-primary mb-0">{selectedRol.nombreRol}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="detail-item mb-3">
                  <label className="form-label fw-bold text-muted mb-1">Estado</label>
                  <p className="mb-0">
                    <span className={`badge ${selectedRol.activo ? 'bg-success' : 'bg-danger'}`}>
                      {selectedRol.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="col-12">
                <div className="detail-item">
                  <label className="form-label fw-bold text-muted mb-1">Descripción</label>
                  <p className="mb-0">{selectedRol.descripcion || 'Sin descripción'}</p>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="detail-item">
                  <label className="form-label fw-bold text-muted mb-1">Fecha de Creación</label>
                  <p className="mb-0">
                    {new Date(selectedRol.createdAt).toLocaleDateString('es-ES', {
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
                    {new Date(selectedRol.updatedAt).toLocaleDateString('es-ES', {
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

            {/* Permisos por Categoría */}
            <div className="permisos-section">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">
                  <i className="bi bi-key me-2"></i>
                  Permisos Asignados ({selectedRol.permisos.length})
                </h6>
              </div>

              <div className="accordion" id="permisosAccordion">
                {Object.entries(permisosPorCategoria).map(([categoria, permisos], index) => (
                  <div key={categoria} className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${index}`}
                        aria-expanded="false"
                        aria-controls={`collapse${index}`}
                      >
                        <div className="d-flex justify-content-between align-items-center w-100 me-3">
                          <span className="fw-bold">{categoria}</span>
                          <span className="badge bg-primary rounded-pill">{permisos.length} permisos</span>
                        </div>
                      </button>
                    </h2>
                    <div
                      id={`collapse${index}`}
                      className="accordion-collapse collapse"
                      data-bs-parent="#permisosAccordion"
                    >
                      <div className="accordion-body">
                        <div className="row">
                          {permisos.map(permiso => (
                            <div key={permiso.id} className="col-md-6 mb-2">
                              <div className="card border-0 bg-light">
                                <div className="card-body py-2">
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-check-circle text-success me-2"></i>
                                    <div>
                                      <strong className="d-block">{permiso.codigo}</strong>
                                      <small className="text-muted">{permiso.descripcion}</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedRol.permisos.length === 0 && (
                <div className="text-center py-4">
                  <i className="bi bi-shield-slash display-4 text-muted"></i>
                  <p className="text-muted mt-2">Este rol no tiene permisos asignados</p>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedRol(null);
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

export default RolesDetailsModal;