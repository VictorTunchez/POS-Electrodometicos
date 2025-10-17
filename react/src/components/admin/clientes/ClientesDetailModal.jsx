import React, { useState } from "react";

const ClienteDetailsModal = ({ cliente, onClose }) => {
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

  if (!cliente) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-light">
            <h5 className="modal-title">
              <i className="bi bi-person me-2"></i>
              Detalles del Cliente
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
                <h4 className="text-primary">{cliente.nombre}</h4>
                <p className="mb-1">
                  <strong>Documento:</strong>{" "}
                  <span className="badge bg-secondary me-1">{cliente.tipoDocumento}</span>
                  {cliente.numeroDocumento}
                </p>
                <p className="mb-1">
                  <strong>Email:</strong> {cliente.email || "No especificado"}
                </p>
                <p className="mb-1">
                  <strong>Teléfono:</strong> {cliente.telefono || "No especificado"}
                </p>
                <p className="mb-0">
                  <strong>Dirección:</strong> {cliente.direccion || "No especificado"}
                </p>
              </div>
              <div className="col-md-4 text-end">
                <div className="text-muted">
                  <small>
                    <strong>Fecha de Registro:</strong> {formatDate(cliente.createdAt)}
                  </small>
                </div>
                <div className="text-muted">
                  <small>
                    <strong>Última Actualización:</strong> {formatDate(cliente.updatedAt)}
                  </small>
                </div>
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
                          <i className="bi bi-person-badge me-2"></i>
                          Información Personal
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-2">
                          <strong>Nombre:</strong> {cliente.nombre}
                        </div>
                        <div className="mb-2">
                          <strong>Tipo de Documento:</strong> {cliente.tipoDocumento}
                        </div>
                        <div className="mb-2">
                          <strong>Número de Documento:</strong> {cliente.numeroDocumento}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="card-title mb-0">
                          <i className="bi bi-telephone me-2"></i>
                          Contacto
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-2">
                          <strong>Email:</strong> {cliente.email || "No especificado"}
                        </div>
                        <div className="mb-2">
                          <strong>Teléfono:</strong> {cliente.telefono || "No especificado"}
                        </div>
                        <div className="mb-0">
                          <strong>Dirección:</strong> {cliente.direccion || "No especificado"}
                        </div>
                      </div>
                    </div>
                  </div>
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

export default ClienteDetailsModal;