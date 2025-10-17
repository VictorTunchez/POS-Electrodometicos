import React, { useState } from "react";
import { useProveedores } from "./useProveedores";
import ProveedorForm from "./ProveedorForm";
import ProveedorDetails from "./ProveedorDetail";
import LoadingState from "../../admin/products/components/LoadingState";
import MensajeAlerta from "../../MensajeAlerta";

const ProveedoresList = () => {
  const {
    proveedores,
    loading,
    error,
    success,
    setError,
    setSuccess,
    eliminarProveedor,
    buscarProveedores,
    cargarProveedores
  } = useProveedores();

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("razonSocial"); // "razonSocial" o "nit"

  // Manejar búsqueda
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      if (searchType === "razonSocial") {
        await buscarProveedores(searchTerm, null);
      } else {
        await buscarProveedores(null, searchTerm);
      }
    } else {
      await cargarProveedores();
    }
  };

  // Manejar limpiar búsqueda
  const handleClearSearch = async () => {
    setSearchTerm("");
    await cargarProveedores();
  };

  // Manejar edición
  const handleEdit = (proveedor) => {
    setEditingProveedor(proveedor);
    setShowForm(true);
  };

  // Manejar ver detalles
  const handleViewDetails = (proveedor) => {
    setSelectedProveedor(proveedor);
    setShowDetails(true);
  };

  // Manejar eliminación
  const handleDelete = async (id, razonSocial) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al proveedor "${razonSocial}"?`)) {
      await eliminarProveedor(id);
    }
  };

  // Manejar cierre del formulario
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProveedor(null);
  };

  if (loading && proveedores.length === 0) {
    return <LoadingState message="Cargando proveedores..." />;
  }

  return (
    <div className="module-container">
      {error && <MensajeAlerta tipo="error" mensaje={error} onClose={() => setError("")} />}
      {success && <MensajeAlerta tipo="exito" mensaje={success} onClose={() => setSuccess("")} />}

      <div className="module-header">
        <div className="header-top">
          <h1>Gestión de Proveedores</h1>
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <i className="bi bi-plus-circle me-2"></i> Nuevo Proveedor
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="search-section mt-3">
          <form onSubmit={handleSearch}>
            <div className="row g-2">
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="razonSocial">Razón Social</option>
                  <option value="nit">NIT</option>
                </select>
              </div>
              <div className="col-md-6">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Buscar por ${searchType === 'razonSocial' ? 'razón social' : 'NIT'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-outline-secondary" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={handleClearSearch}
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Formulario de proveedor */}
      {showForm && (
        <ProveedorForm
          proveedor={editingProveedor}
          onCancel={handleCloseForm}
          onSuccess={handleCloseForm}
        />
      )}

      {/* Lista de proveedores */}
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title mb-0">Lista de Proveedores</h5>
            <span className="badge bg-primary">{proveedores.length} proveedores</span>
          </div>

          {proveedores.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-building display-1 text-muted"></i>
              <h4 className="mt-3">No hay proveedores registrados</h4>
              <p className="text-muted">Comienza agregando tu primer proveedor.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Razón Social</th>
                    <th>Nombre Comercial</th>
                    <th>NIT</th>
                    <th>Ubicación</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((proveedor) => (
                    <tr key={proveedor.id}>
                      <td>
                        <strong>{proveedor.razonSocial}</strong>
                      </td>
                      <td>{proveedor.nombreComercial || '-'}</td>
                      <td>{proveedor.nit}</td>
                      <td>
                        {proveedor.departamento || proveedor.municipio ? (
                          <div>
                            {proveedor.departamento && (
                              <div><small className="text-muted">{proveedor.departamento}</small></div>
                            )}
                            {proveedor.municipio && (
                              <div><small>{proveedor.municipio}</small></div>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {proveedor.contactoNombre ? (
                          <>
                            {proveedor.contactoNombre}
                            {proveedor.contactoTelefono && (
                              <div><small className="text-muted">{proveedor.contactoTelefono}</small></div>
                            )}
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{proveedor.telefono || '-'}</td>
                      <td>{proveedor.email || '-'}</td>
                      <td className="text-end">
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(proveedor)}
                            title="Ver detalles"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleEdit(proveedor)}
                            title="Editar proveedor"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(proveedor.id, proveedor.razonSocial)}
                            title="Eliminar proveedor"
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
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {showDetails && selectedProveedor && (
        <ProveedorDetails
          proveedor={selectedProveedor}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default ProveedoresList;