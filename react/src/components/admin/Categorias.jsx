import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import servicioCategorias from "../../services/servicioCategorias";
import { handleApiError } from "../../utils/errorHandler";
import "./Categorias.css";
import MensajeAlerta from "../MensajeAlerta";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("activos");
  const [formData, setFormData] = useState({
    nombreCategoria: "",
    descripcion: "",
    imagen: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarCategorias();
  }, [viewMode]);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const datos = viewMode === "todos"
        ? await servicioCategorias.obtenerTodasCategorias()
        : await servicioCategorias.obtenerCategorias();
      setCategorias(datos);
      setError("");
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al cargar las categorías");
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
        await servicioCategorias.actualizarCategoria(editingId, formData);
        setSuccess("Categoría actualizada correctamente");
      } else {
        await servicioCategorias.crearCategoria(formData);
        setSuccess("Categoría creada correctamente");
      }
      setShowForm(false);
      resetForm();
      cargarCategorias();
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al guardar la categoría");
      setError(errorMessage);
    }
  };

  const handleEdit = (categoria) => {
    setFormData({
      nombreCategoria: categoria.nombreCategoria,
      descripcion: categoria.descripcion || "",
      imagen: categoria.imagen || ""
    });
    setEditingId(categoria.id);
    setShowForm(true);
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewDetails = async (id) => {
    try {
      const categoria = await servicioCategorias.obtenerCategoriaPorId(id);
      setSelectedCategoria(categoria);
      setShowDetailsModal(true);
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al obtener detalles");
      setError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      try {
        await servicioCategorias.eliminarCategoria(id);
        setSuccess("Categoría eliminada correctamente");
        cargarCategorias();
      } catch (err) {
        const errorMessage = handleApiError(err, "Error al eliminar la categoría");
        setError(errorMessage);
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await servicioCategorias.restaurarCategoria(id);
      setSuccess("Categoría restaurada correctamente");
      cargarCategorias();
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al restaurar la categoría");
      setError(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      nombreCategoria: "",
      descripcion: "",
      imagen: ""
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setShowForm(false);
    resetForm();
  };

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nombreCategoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (categoria.descripcion && categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="categorias-container">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span className="ms-3">Cargando categorías...</span>
        </div>
      </div>
    );
  }

  return (
      <div className="module-container">
        {/* Alertas flotantes */}
        {error && <MensajeAlerta tipo="error" mensaje={error} onClose={() => setError("")} />}
        {success && <MensajeAlerta tipo="exito" mensaje={success} onClose={() => setSuccess("")} />}

        <div className="module-header">
          <div className="header-top">
{/*             <button className="btn btn-outline-secondary back-button" onClick={() => navigate('/panel')}> */}
{/*               <i className="bi bi-arrow-left me-2"></i> Volver al Inicio */}
{/*             </button> */}
{/*             <h1>Gestión de Categorías</h1> */}
            <button
              className="btn btn-primary new-button"
              onClick={() => setShowForm(true)}
            >
              <i className="bi bi-plus-circle me-2"></i> Nueva Categoría
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
                placeholder="Buscar categoría por nombre o descripción..."
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
                  Categorías Activas
                </button>
                <button
                  type="button"
                  className={`btn ${viewMode === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('todos')}
                >
                  Todas las Categorías
                </button>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div id="form-section" className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">{editingId ? "Editar Categoría" : "Crear Nueva Categoría"}</h5>
              <button className="btn-close" onClick={cancelEdit} aria-label="Cerrar"></button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="nombreCategoria" className="form-label">Nombre de la Categoría *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nombreCategoria"
                      name="nombreCategoria"
                      value={formData.nombreCategoria}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                      placeholder="Ej: Electrónicos"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="imagen" className="form-label">URL de la Imagen</label>
                    <input
                      type="text"
                      className="form-control"
                      id="imagen"
                      name="imagen"
                      value={formData.imagen}
                      onChange={handleInputChange}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      id="descripcion"
                      name="descripcion"
                      rows="3"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      placeholder="Describe brevemente esta categoría"
                    ></textarea>
                  </div>
                </div>
                <div className="d-flex gap-2 justify-content-end mt-4">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? "Actualizar Categoría" : "Crear Categoría"}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="card-title mb-0">
                {viewMode === 'activos' ? 'Categorías Activas' : 'Todas las Categorías'}
              </h5>
              <span className="badge bg-primary">{filteredCategorias.length}</span>
            </div>

            {filteredCategorias.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-tag display-1 text-muted"></i>
                <h4 className="mt-3">
                  {viewMode === 'activos' ? 'No hay categorías activas' : 'No hay categorías registradas'}
                </h4>
                <p className="text-muted">
                  {viewMode === 'activos'
                    ? 'Todas las categorías están inactivas o no hay categorías'
                    : 'Comienza agregando tu primera categoría'
                  }
                </p>
                <button
                  className="btn btn-primary mt-2"
                  onClick={() => setShowForm(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i> Crear Categoría
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Productos</th>
                      <th>Estado Sistema</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategorias.map((categoria) => (
                      <tr key={categoria.id} className={!categoria.activo ? 'table-secondary' : ''}>
                        <td>
                          <div className="d-flex align-items-center">
                            {categoria.imagen && (
                              <img 
                                src={categoria.imagen} 
                                alt={categoria.nombreCategoria}
                                className="me-3 rounded"
                                style={{width: '40px', height: '40px', objectFit: 'cover'}}
                              />
                            )}
                            {!categoria.imagen && (
                              <i className="bi bi-tag me-3 text-primary fs-5"></i>
                            )}
                            <div>
                              <strong>{categoria.nombreCategoria}</strong>
                              {!categoria.activo && (
                                <div>
                                  <small className="text-muted">Eliminada: {new Date(categoria.deletedAt).toLocaleDateString()}</small>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {categoria.descripcion ? (
                            <span title={categoria.descripcion}>
                              {categoria.descripcion.length > 50 
                                ? `${categoria.descripcion.substring(0, 50)}...` 
                                : categoria.descripcion
                              }
                            </span>
                          ) : (
                            <span className="text-muted fst-italic">Sin descripción</span>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-info">{categoria.cantidadProductos || 0}</span>
                        </td>
                        <td>
                          <span className={`badge ${categoria.activo ? 'bg-success' : 'bg-danger'}`}>
                            {categoria.activo ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewDetails(categoria.id)}
                              title="Ver detalles"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            {categoria.activo ? (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleEdit(categoria)}
                                  title="Editar categoría"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(categoria.id)}
                                  title="Eliminar categoría"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleRestore(categoria.id)}
                                title="Restaurar categoría"
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

        {/* Modal para ver detalles de categoría */}
        {showDetailsModal && selectedCategoria && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-tag me-2"></i>
                    Detalles de la Categoría
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedCategoria(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Información básica */}
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Nombre de la Categoría</strong>
                      <p className="fs-5 text-primary">{selectedCategoria.nombreCategoria}</p>
                    </div>
                    <div className="detail-item">
                      <strong>Descripción</strong>
                      <p>{selectedCategoria.descripcion || <span className="text-muted fst-italic">Sin descripción</span>}</p>
                    </div>
                    <div className="detail-item">
                      <strong>Número de Productos</strong>
                      <p>
                        <span className="badge bg-info fs-6">{selectedCategoria.cantidadProductos || 0}</span>
                      </p>
                    </div>
                    {selectedCategoria.imagen && (
                      <div className="detail-item">
                        <strong>Imagen</strong>
                        <div className="mt-2">
                          <img 
                            src={selectedCategoria.imagen} 
                            alt={selectedCategoria.nombreCategoria}
                            className="img-thumbnail"
                            style={{maxWidth: '200px', maxHeight: '200px'}}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Estado y fechas */}
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Estado del Sistema</strong>
                      <p>
                        <span className={`badge ${selectedCategoria.activo ? 'bg-success' : 'bg-danger'}`}>
                          {selectedCategoria.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </p>
                    </div>
                    <div className="detail-item">
                      <strong>Fecha de Creación</strong>
                      <p>{new Date(selectedCategoria.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                    <div className="detail-item">
                      <strong>Última Actualización</strong>
                      <p>{new Date(selectedCategoria.updatedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>

                  {/* Información adicional si está inactiva */}
                  {!selectedCategoria.activo && selectedCategoria.deletedAt && (
                    <div className="rol-detail-section">
                      <h6>
                        <i className="bi bi-info-circle me-2"></i>
                        Información de Eliminación
                      </h6>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <strong>Fecha de Eliminación</strong>
                          <p>{new Date(selectedCategoria.deletedAt).toLocaleDateString('es-ES', {
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
                      setSelectedCategoria(null);
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

export default Categorias;