import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import servicioUsuarios from "../../services/servicioUsuarios";
import { handleApiError } from "../../utils/errorHandler";
import "./Usuarios.css";
import MensajeAlerta from "../MensajeAlerta";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("activos");
  const [formData, setFormData] = useState({
    email: "",
    nombre: "",
    apellido: "",
    contrasena: "",
    rolId: "",
    sucursalId: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, [viewMode]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [usuariosData, rolesData, sucursalesData] = await Promise.all([
        viewMode === "todos" ? servicioUsuarios.obtenerTodosUsuarios() : servicioUsuarios.obtenerUsuarios(),
        servicioUsuarios.obtenerRoles(),
        servicioUsuarios.obtenerSucursales()
      ]);
      setUsuarios(usuariosData);
      setRoles(rolesData);
      setSucursales(sucursalesData);
      setError("");
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al cargar los datos");
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
        await servicioUsuarios.actualizarUsuario(editingId, formData);
        setSuccess("Usuario actualizado correctamente");
      } else {
        await servicioUsuarios.crearUsuario(formData);
        setSuccess("Usuario creado correctamente");
      }
      setShowForm(false);
      resetForm();
      cargarDatos();
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al guardar el usuario");
      setError(errorMessage);
    }
  };

  const handleEdit = (usuario) => {
    setFormData({
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      contrasena: "", // No cargar contraseña por seguridad
      rolId: usuario.rolId,
      sucursalId: usuario.sucursalId || ""
    });
    setEditingId(usuario.id);
    setShowForm(true);
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewDetails = async (id) => {
    try {
      const usuario = await servicioUsuarios.obtenerUsuarioPorId(id);
      setSelectedUsuario(usuario);
      setShowDetailsModal(true);
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al obtener detalles");
      setError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await servicioUsuarios.eliminarUsuario(id);
        setSuccess("Usuario eliminado correctamente");
        cargarDatos();
      } catch (err) {
        const errorMessage = handleApiError(err, "Error al eliminar el usuario");
        setError(errorMessage);
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await servicioUsuarios.restaurarUsuario(id);
      setSuccess("Usuario restaurado correctamente");
      cargarDatos();
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al restaurar el usuario");
      setError(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      nombre: "",
      apellido: "",
      contrasena: "",
      rolId: "",
      sucursalId: ""
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setShowForm(false);
    resetForm();
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="usuarios-container">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span className="ms-3">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="usuarios-container">
      {/* Alertas flotantes */}
      {error && <MensajeAlerta tipo="error" mensaje={error} onClose={() => setError("")} />}
      {success && <MensajeAlerta tipo="exito" mensaje={success} onClose={() => setSuccess("")} />}

      <div className="usuarios-header">
        <div className="header-top">
          <button className="btn btn-outline-secondary back-button" onClick={() => navigate('/panel')}>
            <i className="bi bi-arrow-left me-2"></i> Volver al Panel
          </button>
          <h1>Gestión de Usuarios</h1>
          <button
            className="btn btn-primary new-button"
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-plus-circle me-2"></i> Nuevo Usuario
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
              placeholder="Buscar usuario por email, nombre o apellido..."
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
                Usuarios Activos
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('todos')}
              >
                Todos los Usuarios
              </button>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div id="form-section" className="card form-modern mb-4">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">{editingId ? "Editar Usuario" : "Crear Nuevo Usuario"}</h5>
            <button className="btn-close" onClick={cancelEdit} aria-label="Cerrar"></button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="contrasena" className="form-label">
                    {editingId ? "Nueva Contraseña" : "Contraseña *"}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="contrasena"
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleInputChange}
                    required={!editingId}
                    placeholder={editingId ? "Dejar vacío para no cambiar" : "Mínimo 8 caracteres"}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="nombre" className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    placeholder="Nombre del usuario"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="apellido" className="form-label">Apellido *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    required
                    placeholder="Apellido del usuario"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="rolId" className="form-label">Rol *</label>
                  <select
                    className="form-select"
                    id="rolId"
                    name="rolId"
                    value={formData.rolId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.filter(rol => rol.activo).map(rol => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombreRol}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="sucursalId" className="form-label">Sucursal (Opcional)</label>
                  <select
                    className="form-select"
                    id="sucursalId"
                    name="sucursalId"
                    value={formData.sucursalId}
                    onChange={handleInputChange}
                  >
                    <option value="">Sin sucursal</option>
                    {sucursales.filter(sucursal => sucursal.activo).map(sucursal => (
                      <option key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombreSucursal}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2 justify-content-end mt-4">
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Actualizar Usuario" : "Crear Usuario"}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card usuarios-content">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title mb-0">
              {viewMode === 'activos' ? 'Usuarios Activos' : 'Todos los Usuarios'}
            </h5>
            <span className="badge bg-primary">{filteredUsuarios.length}</span>
          </div>

          {filteredUsuarios.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people display-1 text-muted"></i>
              <h4 className="mt-3">
                {viewMode === 'activos' ? 'No hay usuarios activos' : 'No hay usuarios registrados'}
              </h4>
              <p className="text-muted">
                {viewMode === 'activos'
                  ? 'Todos los usuarios están inactivos o no hay usuarios'
                  : 'Comienza agregando tu primer usuario'
                }
              </p>
              <button
                className="btn btn-primary mt-2"
                onClick={() => setShowForm(true)}
              >
                <i className="bi bi-plus-circle me-2"></i> Crear Usuario
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Sucursal</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id} className={!usuario.activo ? 'table-secondary' : ''}>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person me-2 text-primary"></i>
                          <div>
                            <strong>{usuario.nombre} {usuario.apellido}</strong>
                            {!usuario.activo && (
                              <div>
                                <small className="text-muted">Eliminado: {new Date(usuario.deletedAt).toLocaleDateString()}</small>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{usuario.email}</td>
                      <td>
                        <span className="badge bg-info">{usuario.rolNombre}</span>
                      </td>
                      <td>
                        {usuario.sucursalNombre ||
                         <span className="text-muted">Sin sucursal</span>}
                      </td>
                      <td>
                        <span className={`badge ${usuario.activo ? 'bg-success' : 'bg-danger'}`}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(usuario.id)}
                            title="Ver detalles"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {usuario.activo ? (
                            <>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleEdit(usuario)}
                                title="Editar usuario"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(usuario.id)}
                                title="Eliminar usuario"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleRestore(usuario.id)}
                              title="Restaurar usuario"
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
      {showDetailsModal && selectedUsuario && (
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
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Nombre Completo</strong>
                    <p className="fs-5 text-primary">{selectedUsuario.nombre} {selectedUsuario.apellido}</p>
                  </div>
                  <div className="detail-item">
                    <strong>Email</strong>
                    <p>{selectedUsuario.email}</p>
                  </div>
                  <div className="detail-item">
                    <strong>Rol</strong>
                    <p><span className="badge bg-info">{selectedUsuario.rolNombre}</span></p>
                  </div>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Sucursal</strong>
                    <p>{selectedUsuario.sucursalNombre || <span className="text-muted">Sin sucursal asignada</span>}</p>
                  </div>
                  <div className="detail-item">
                    <strong>Estado del Sistema</strong>
                    <p>
                      <span className={`badge ${selectedUsuario.activo ? 'bg-success' : 'bg-danger'}`}>
                        {selectedUsuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>
                  <div className="detail-item">
                    <strong>Fecha de Creación</strong>
                    <p>{new Date(selectedUsuario.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>

                {!selectedUsuario.activo && selectedUsuario.deletedAt && (
                  <div className="rol-detail-section">
                    <h6>
                      <i className="bi bi-info-circle me-2"></i>
                      Información de Eliminación
                    </h6>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Fecha de Eliminación</strong>
                        <p>{new Date(selectedUsuario.deletedAt).toLocaleDateString('es-ES', {
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
      )}
    </div>
  );
}

export default Usuarios;