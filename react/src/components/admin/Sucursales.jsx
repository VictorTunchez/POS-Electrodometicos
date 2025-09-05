import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import servicioSucursales from "../../services/servicioSucursales";
import { handleApiError } from "../../utils/errorHandler";
import "./Sucursales.css";
import MensajeAlerta from "../MensajeAlerta";

function Sucursales() {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("activos");
  const [formData, setFormData] = useState({
    nombreSucursal: "",
    direccion: "",
    telefono: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarSucursales();
  }, [viewMode]);

  const cargarSucursales = async () => {
    try {
      setLoading(true);
      const datos = viewMode === "todos"
        ? await servicioSucursales.obtenerTodasSucursales()
        : await servicioSucursales.obtenerSucursales();
      setSucursales(datos);
      setError("");
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al cargar las sucursales");
      setError(errorMessage);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await servicioSucursales.actualizarSucursal(editingId, formData);
        setSuccess("Sucursal actualizada correctamente");
      } else {
        await servicioSucursales.crearSucursal(formData);
        setSuccess("Sucursal creada correctamente");
      }
      setShowForm(false);
      resetForm();
      cargarSucursales();
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al guardar la sucursal");
      setError(errorMessage);
    }
  };

  const handleEdit = (sucursal) => {
    setFormData({
      nombreSucursal: sucursal.nombreSucursal,
      direccion: sucursal.direccion,
      telefono: sucursal.telefono
    });
    setEditingId(sucursal.id);
    setShowForm(true);
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewDetails = async (id) => {
    try {
      const sucursal = await servicioSucursales.obtenerSucursalPorId(id);
      setSelectedSucursal(sucursal);
      setShowDetailsModal(true);
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al obtener detalles");
      setError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta sucursal?")) {
      try {
        await servicioSucursales.eliminarSucursal(id);
        setSuccess("Sucursal eliminada correctamente");
        cargarSucursales();
      } catch (err) {
        const errorMessage = handleApiError(err, "Error al eliminar la sucursal");
        setError(errorMessage);
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await servicioSucursales.restaurarSucursal(id);
      setSuccess("Sucursal restaurada correctamente");
      cargarSucursales();
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al restaurar la sucursal");
      setError(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      nombreSucursal: "",
      direccion: "",
      telefono: ""
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setShowForm(false);
    resetForm();
  };

  const filteredSucursales = sucursales.filter(sucursal =>
    sucursal.nombreSucursal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sucursal.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="sucursales-container">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span className="ms-3">Cargando sucursales...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sucursales-container">
      {/* Alertas flotantes */}
      {error && <MensajeAlerta tipo="error" mensaje={error} onClose={() => setError("")} />}
      {success && <MensajeAlerta tipo="exito" mensaje={success} onClose={() => setSuccess("")} />}

      <div className="sucursales-header">
        <div className="header-top">
          <button className="btn btn-outline-secondary back-button" onClick={() => navigate('/panel')}>
            <i className="bi bi-arrow-left me-2"></i> Volver al Panel
          </button>
          <h1>Gestión de Sucursales</h1>
          <button
            className="btn btn-primary new-button"
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-plus-circle me-2"></i> Nueva Sucursal
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
              placeholder="Buscar sucursal por nombre o dirección..."
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
                Sucursales Activas
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('todos')}
              >
                Todas las Sucursales
              </button>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div id="form-section" className="card form-modern mb-4">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">{editingId ? "Editar Sucursal" : "Crear Nueva Sucursal"}</h5>
            <button className="btn-close" onClick={cancelEdit} aria-label="Cerrar"></button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="nombreSucursal" className="form-label">Nombre de la Sucursal</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombreSucursal"
                    name="nombreSucursal"
                    value={formData.nombreSucursal}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Sucursal Centro"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="direccion" className="form-label">Dirección</label>
                  <input
                    type="text"
                    className="form-control"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Av. Reforma 123"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="telefono" className="form-label">Teléfono</label>
                  <input
                    type="text"
                    className="form-control"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: 12345678"
                  />
                </div>
              </div>
              <div className="d-flex gap-2 justify-content-end mt-4">
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Actualizar Sucursal" : "Crear Sucursal"}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card sucursales-content">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title mb-0">
              {viewMode === 'activos' ? 'Sucursales Activas' : 'Todas las Sucursales'}
            </h5>
            <span className="badge bg-primary">{filteredSucursales.length}</span>
          </div>

          {filteredSucursales.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-shop display-1 text-muted"></i>
              <h4 className="mt-3">
                {viewMode === 'activos' ? 'No hay sucursales activas' : 'No hay sucursales registradas'}
              </h4>
              <p className="text-muted">
                {viewMode === 'activos'
                  ? 'Todas las sucursales están inactivas o no hay sucursales'
                  : 'Comienza agregando tu primera sucursal'
                }
              </p>
              <button
                className="btn btn-primary mt-2"
                onClick={() => setShowForm(true)}
              >
                <i className="bi bi-plus-circle me-2"></i> Crear Sucursal
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>Teléfono</th>
                    <th>Estado Sistema</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSucursales.map((sucursal) => (
                    <tr key={sucursal.id} className={!sucursal.activo ? 'table-secondary' : ''}>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-shop me-2 text-primary"></i>
                          <div>
                            <strong>{sucursal.nombreSucursal}</strong>
                            {!sucursal.activo && (
                              <div>
                                <small className="text-muted">Eliminada: {new Date(sucursal.deletedAt).toLocaleDateString()}</small>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{sucursal.direccion}</td>
                      <td>{sucursal.telefono}</td>
                      <td>
                        <span className={`badge ${sucursal.activo ? 'bg-success' : 'bg-danger'}`}>
                          {sucursal.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(sucursal.id)}
                            title="Ver detalles"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {sucursal.activo ? (
                            <>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleEdit(sucursal)}
                                title="Editar sucursal"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(sucursal.id)}
                                title="Eliminar sucursal"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleRestore(sucursal.id)}
                              title="Restaurar sucursal"
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

      {/* Modal para ver detalles de sucursal */}
      {showDetailsModal && selectedSucursal && (
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
                {/* Información básica */}
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Nombre de la Sucursal</strong>
                    <p className="fs-5 text-primary">{selectedSucursal.nombreSucursal}</p>
                  </div>
                  <div className="detail-item">
                    <strong>Dirección</strong>
                    <p>{selectedSucursal.direccion}</p>
                  </div>
                  <div className="detail-item">
                    <strong>Teléfono</strong>
                    <p>{selectedSucursal.telefono}</p>
                  </div>
                </div>

                {/* Estado y fechas */}
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Estado del Sistema</strong>
                    <p>
                      <span className={`badge ${selectedSucursal.activo ? 'bg-success' : 'bg-danger'}`}>
                        {selectedSucursal.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </p>
                  </div>
                  <div className="detail-item">
                    <strong>Fecha de Creación</strong>
                    <p>{new Date(selectedSucursal.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                  <div className="detail-item">
                    <strong>Última Actualización</strong>
                    <p>{new Date(selectedSucursal.updatedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>

                {/* Información adicional si está inactiva */}
                {!selectedSucursal.activo && selectedSucursal.deletedAt && (
                  <div className="rol-detail-section">
                    <h6>
                      <i className="bi bi-info-circle me-2"></i>
                      Información de Eliminación
                    </h6>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Fecha de Eliminación</strong>
                        <p>{new Date(selectedSucursal.deletedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </div>
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
      )}
    </div>
  );
}

export default Sucursales;