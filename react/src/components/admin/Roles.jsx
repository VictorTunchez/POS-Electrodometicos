import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import servicioRoles from "../../services/servicioRoles";
import MensajeAlerta from "../MensajeAlerta";
import { handleApiError } from "../../utils/errorHandler";
import "./Roles.css";

function Roles() {
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPermisos, setSelectedPermisos] = useState(new Set());
  const [viewMode, setViewMode] = useState("activos");
  const [formData, setFormData] = useState({
    nombreRol: "",
    descripcion: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [errorDetails, setErrorDetails] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRol, setSelectedRol] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, [viewMode]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [rolesData, permisosData] = await Promise.all([
        viewMode === "todos" ? servicioRoles.obtenerTodosRoles() : servicioRoles.obtenerRoles(),
        servicioRoles.obtenerPermisos()
      ]);
      setRoles(rolesData);
      setPermisos(permisosData);
      setError("");
      setErrorDetails([]);
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al cargar los datos");
      setError(errorMessage);

      if (err.response?.data?.detalles) {
        setErrorDetails(Object.values(err.response.data.detalles));
      } else {
        setErrorDetails([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePermisoChange = (permisoId, isChecked) => {
    const nuevosPermisos = new Set(selectedPermisos);
    if (isChecked) {
      nuevosPermisos.add(permisoId);
    } else {
      nuevosPermisos.delete(permisoId);
    }
    setSelectedPermisos(nuevosPermisos);
  };

  const handleCategoriaChange = (categoria, isChecked) => {
    const nuevosPermisos = new Set(selectedPermisos);
    const permisosCategoria = permisos.filter(p => p.categoria === categoria);

    if (isChecked) {
      permisosCategoria.forEach(permiso => nuevosPermisos.add(permiso.id));
    } else {
      permisosCategoria.forEach(permiso => nuevosPermisos.delete(permiso.id));
    }
    setSelectedPermisos(nuevosPermisos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const datosEnvio = {
        ...formData,
        permisoIds: Array.from(selectedPermisos)
      };

      if (editingId) {
        await servicioRoles.actualizarRol(editingId, datosEnvio);
        setSuccess("Rol actualizado correctamente");
      } else {
        await servicioRoles.crearRol(datosEnvio);
        setSuccess("Rol creado correctamente");
      }

      setShowForm(false);
      resetForm();
      cargarDatos();
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al guardar el rol");
      setError(errorMessage);

      if (err.response?.data?.detalles) {
        setErrorDetails(Object.values(err.response.data.detalles));
      } else {
        setErrorDetails([]);
      }
    }
  };

  const handleEdit = (rol) => {
    setFormData({
      nombreRol: rol.nombreRol,
      descripcion: rol.descripcion
    });
    setEditingId(rol.id);
    setSelectedPermisos(new Set(rol.permisos.map(p => p.id)));
    setShowForm(true);
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewDetails = async (id) => {
    try {
      const rol = await servicioRoles.obtenerRolPorId(id);
      setSelectedRol(rol);
      setShowDetailsModal(true);
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al obtener detalles");
      setError(errorMessage);
      setErrorDetails([]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este rol?")) {
      try {
        await servicioRoles.eliminarRol(id);
        setSuccess("Rol eliminado correctamente");
        cargarDatos();
      } catch (err) {
        const errorMessage = handleApiError(err, "Error al eliminar el rol");
        setError(errorMessage);
        setErrorDetails([]);
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await servicioRoles.restaurarRol(id);
      setSuccess("Rol restaurado correctamente");
      cargarDatos();
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al restaurar el rol");
      setError(errorMessage);
      setErrorDetails([]);
    }
  };

  const resetForm = () => {
    setFormData({ nombreRol: "", descripcion: "" });
    setSelectedPermisos(new Set());
    setEditingId(null);
    setErrorDetails([]);
  };

  const cancelEdit = () => {
    setShowForm(false);
    resetForm();
  };

  const groupedPermisos = permisos.reduce((acc, permiso) => {
    if (!acc[permiso.categoria]) {
      acc[permiso.categoria] = [];
    }
    acc[permiso.categoria].push(permiso);
    return acc;
  }, {});

  const isCategoriaCompleta = (categoria) => {
    const permisosCategoria = permisos.filter(p => p.categoria === categoria);
    return permisosCategoria.every(p => selectedPermisos.has(p.id));
  };

  const isCategoriaParcial = (categoria) => {
    const permisosCategoria = permisos.filter(p => p.categoria === categoria);
    const seleccionados = permisosCategoria.filter(p => selectedPermisos.has(p.id));
    return seleccionados.length > 0 && seleccionados.length < permisosCategoria.length;
  };

  const filteredRoles = roles.filter(rol =>
    rol.nombreRol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="roles-container">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span className="ms-3">Cargando roles y permisos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="roles-container">
      {/* Alertas flotantes */}
      {error && (
        <MensajeAlerta
          tipo="error"
          mensaje={error}
          detalles={errorDetails}
          onClose={() => {
            setError("");
            setErrorDetails([]);
          }}
        />
      )}
      {success && (
        <MensajeAlerta
          tipo="exito"
          mensaje={success}
          onClose={() => setSuccess("")}
        />
      )}

      <div className="roles-header">
        <div className="header-top">
          <button className="btn btn-outline-secondary back-button" onClick={() => navigate('/panel')}>
            <i className="bi bi-arrow-left me-2"></i> Volver al Panel
          </button>
          <h1>Gestión de Roles y Permisos</h1>
          <button
            className="btn btn-primary new-button"
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-plus-circle me-2"></i> Nuevo Rol
          </button>
        </div>

        <div className="search-section">
          <div className="input-group search-box">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar rol por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="view-toggle mt-3">
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn ${viewMode === 'activos' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('activos')}
              >
                Roles Activos
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('todos')}
              >
                Todos los Roles
              </button>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div id="form-section" className="card form-modern mb-4">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">{editingId ? "Editar Rol" : "Crear Nuevo Rol"}</h5>
            <button className="btn-close" onClick={cancelEdit} aria-label="Cerrar"></button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label htmlFor="nombreRol" className="form-label">Nombre del Rol *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombreRol"
                    name="nombreRol"
                    value={formData.nombreRol}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: ADMINISTRADOR"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="descripcion" className="form-label">Descripción *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Acceso completo al sistema"
                  />
                </div>
              </div>

              <div className="permisos-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Seleccionar Permisos *</h6>
                  <small className="text-muted">
                    {selectedPermisos.size} permiso(s) seleccionado(s)
                  </small>
                </div>

                <div className="row">
                  {Object.entries(groupedPermisos).map(([categoria, permisosCategoria]) => (
                    <div key={categoria} className="col-md-6 col-lg-4 mb-3">
                      <div className="card h-100">
                        <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">{categoria}</h6>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={isCategoriaCompleta(categoria)}
                              ref={input => {
                                if (input) {
                                  input.indeterminate = isCategoriaParcial(categoria);
                                }
                              }}
                              onChange={(e) => handleCategoriaChange(categoria, e.target.checked)}
                            />
                          </div>
                        </div>
                        <div className="card-body">
                          {permisosCategoria.map(permiso => (
                            <div key={permiso.id} className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`permiso-${permiso.id}`}
                                checked={selectedPermisos.has(permiso.id)}
                                onChange={(e) => handlePermisoChange(permiso.id, e.target.checked)}
                              />
                              <label className="form-check-label" htmlFor={`permiso-${permiso.id}`}>
                                <div>
                                  <strong>{permiso.codigo.replace(/_/g, ' ')}</strong>
                                </div>
                                <small className="text-muted">{permiso.descripcion}</small>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-end mt-4">
                <button type="submit" className="btn btn-primary" disabled={selectedPermisos.size === 0}>
                  {editingId ? "Actualizar Rol" : "Crear Rol"}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card roles-content">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title mb-0">
              {viewMode === 'activos' ? 'Lista de Roles Activos' : 'Todos los Roles'}
            </h5>
            <span className="badge bg-primary">{filteredRoles.length} roles</span>
          </div>

          {filteredRoles.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-shield-exclamation display-1 text-muted"></i>
              <h4 className="mt-3">
                {viewMode === 'activos' ? 'No hay roles activos' : 'No hay roles registrados'}
              </h4>
              <p className="text-muted">
                {viewMode === 'activos'
                  ? 'Todos los roles están inactivos o no hay roles creados'
                  : 'Comienza agregando tu primer rol'
                }
              </p>
              <button
                className="btn btn-primary mt-2"
                onClick={() => setShowForm(true)}
              >
                <i className="bi bi-plus-circle me-2"></i> Crear Rol
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Permisos</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((rol) => (
                    <tr key={rol.id} className={!rol.activo ? 'table-secondary' : ''}>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-shield me-2 text-primary"></i>
                          <div>
                            <strong>{rol.nombreRol}</strong>
                            {!rol.activo && (
                              <div>
                                <small className="text-muted">Eliminado: {new Date(rol.deletedAt).toLocaleDateString()}</small>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{rol.descripcion}</td>
                      <td>
                        <span className={`badge ${rol.activo ? 'bg-success' : 'bg-danger'}`}>
                          {rol.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {rol.permisos.slice(0, 3).map(permiso => (
                            <span key={permiso.id} className="badge bg-info text-dark">
                              {permiso.codigo}
                            </span>
                          ))}
                          {rol.permisos.length > 3 && (
                            <span className="badge bg-secondary">
                              +{rol.permisos.length - 3} más
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(rol.id)}
                            title="Ver detalles"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {rol.activo ? (
                            <>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleEdit(rol)}
                                title="Editar rol"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(rol.id)}
                                title="Eliminar rol"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleRestore(rol.id)}
                              title="Restaurar rol"
                            >
                              <i className="bi bi-arrow-clockwise"></i>
                            </button>
                          )}
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
      {/* Modal para ver detalles */}
      {showDetailsModal && selectedRol && (
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
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Nombre del Rol</strong>
                    <p className="fs-5 text-primary">{selectedRol.nombreRol}</p>
                  </div>
                  <div className="detail-item">
                    <strong>Descripción</strong>
                    <p>{selectedRol.descripcion || 'Sin descripción'}</p>
                  </div>
                  <div className="detail-item">
                    <strong>Estado</strong>
                    <p>
                      <span className={`badge ${selectedRol.activo ? 'bg-success' : 'bg-danger'}`}>
                        {selectedRol.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Fechas */}
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Fecha de Creación</strong>
                    <p>{new Date(selectedRol.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                  <div className="detail-item">
                    <strong>Última Actualización</strong>
                    <p>{new Date(selectedRol.updatedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>

                {/* Permisos */}
                <div className="rol-detail-section">
                  <h6>
                    <i className="bi bi-key me-2"></i>
                    Permisos Asignados ({selectedRol.permisos.length})
                  </h6>
                  <div className="mb-3">
                    {selectedRol.permisos.map(permiso => (
                      <span key={permiso.id} className="badge bg-info text-dark me-1 mb-1">
                        {permiso.codigo}
                      </span>
                    ))}
                  </div>

                  {selectedRol.permisos.length > 0 && (
                    <div>
                      <h6 className="mt-3">Organizados por Categoría</h6>
                      {Object.entries(
                        selectedRol.permisos.reduce((acc, permiso) => {
                          if (!acc[permiso.categoria]) {
                            acc[permiso.categoria] = [];
                          }
                          acc[permiso.categoria].push(permiso);
                          return acc;
                        }, {})
                      ).map(([categoria, permisos]) => (
                        <div key={categoria} className="permisos-categoria">
                          <h6>{categoria}</h6>
                          <div className="d-flex flex-wrap">
                            {permisos.map(permiso => (
                              <span key={permiso.id} className="badge bg-secondary me-1 mb-1">
                                {permiso.codigo}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
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
      )}
    </div>
  );
}

export default Roles;