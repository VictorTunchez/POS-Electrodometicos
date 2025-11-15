import React, { useState, useEffect } from "react";
import tarjetaService from "../../../services/servicioTarjetaRegalo";
import MensajeAlerta from "../../MensajeAlerta";
import { handleApiError } from "../../../utils/errorHandler";

function TarjetasRegalo() {
  const [tarjetas, setTarjetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("activos");

  const [formData, setFormData] = useState({
    codigo: "",
    montoInicial: "",
    moneda: "GTQ",
    fechaExpiracion: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    cargarTarjetas();
  }, [viewMode]);

  const cargarTarjetas = async () => {
    try {
      setLoading(true);
      const datos = await tarjetaService.listar();

      const filtradas =
        viewMode === "activos"
          ? datos.filter((t) => t.estado === "ACTIVA" || t.estado === "activa")
          : datos;

      setTarjetas(filtradas);
      setError("");
    } catch (err) {
      const msg = handleApiError(err, "Error al cargar las tarjetas");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === "montoInicial" ? parseFloat(value) || "" : value 
    });
  };

  // Función para convertir fecha a formato ISO para Instant
  const convertirFechaAInstant = (fechaString) => {
    if (!fechaString) return "";
    // Convertir "YYYY-MM-DD" a "YYYY-MM-DDT23:59:59.999Z" (fin del día en UTC)
    return `${fechaString}T23:59:59.999Z`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Preparar datos para enviar con formato correcto para Instant
      const datosEnvio = {
        ...formData,
        montoInicial: parseFloat(formData.montoInicial),
        fechaExpiracion: convertirFechaAInstant(formData.fechaExpiracion)
      };

      if (editingId) {
        await tarjetaService.actualizar(editingId, datosEnvio);
        setSuccess("Tarjeta actualizada correctamente");
      } else {
        await tarjetaService.crear(datosEnvio);
        setSuccess("Tarjeta creada correctamente");
      }
      setShowForm(false);
      resetForm();
      cargarTarjetas();
    } catch (err) {
      setError(handleApiError(err, "Error al guardar la tarjeta"));
    }
  };

  const handleEdit = (tarjeta) => {
    // Convertir Instant de vuelta a formato de input date
    let fechaFormateada = "";
    if (tarjeta.fechaExpiracion) {
      const fecha = new Date(tarjeta.fechaExpiracion);
      fechaFormateada = fecha.toISOString().split('T')[0];
    }

    setFormData({
      codigo: tarjeta.codigo || "",
      montoInicial: tarjeta.montoInicial || "",
      moneda: tarjeta.moneda || "GTQ",
      fechaExpiracion: fechaFormateada,
    });
    setEditingId(tarjeta.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas anular esta tarjeta?")) {
      try {
        await tarjetaService.anular(id);
        setSuccess("Tarjeta anulada correctamente");
        cargarTarjetas();
      } catch (err) {
        setError(handleApiError(err, "Error al anular la tarjeta"));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: "",
      montoInicial: "",
      moneda: "GTQ",
      fechaExpiracion: "",
    });
    setEditingId(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  // Buscador
  const filtered = tarjetas.filter(
    (t) =>
      t.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.moneda?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="module-container">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "50vh" }}
        >
          <div className="spinner-border text-primary" />
          <span className="ms-3">Cargando tarjetas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      {error && (
        <MensajeAlerta 
          tipo="error" 
          mensaje={error} 
          onClose={() => setError("")} 
        />
      )}
      {success && (
        <MensajeAlerta 
          tipo="exito" 
          mensaje={success} 
          onClose={() => setSuccess("")} 
        />
      )}

      <div className="module-header">
        <div className="header-top">
          <button 
            className="btn btn-primary new-button" 
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-plus-circle me-2" />
            Nueva Tarjeta
          </button>
        </div>

        <div className="search-section">
          <div className="input-group search-box">
            <span className="input-group-text">
              <i className="bi bi-search" />
            </span>
            <input
              className="form-control"
              placeholder="Buscar por código o moneda…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="view-toggle mt-3">
            <div className="btn-group">
              <button
                className={`btn ${
                  viewMode === "activos" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setViewMode("activos")}
              >
                Activas
              </button>
              <button
                className={`btn ${
                  viewMode === "todos" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setViewMode("todos")}
              >
                Todas
              </button>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{editingId ? "Editar Tarjeta" : "Crear Tarjeta"}</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleCloseForm}
              aria-label="Cerrar"
            />
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Código *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="codigo"
                    required
                    maxLength={20}
                    value={formData.codigo}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Monto Inicial *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control"
                    name="montoInicial"
                    required
                    value={formData.montoInicial}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Moneda *</label>
                  <select
                    className="form-select"
                    name="moneda"
                    value={formData.moneda}
                    onChange={handleInputChange}
                  >
                    <option value="GTQ">GTQ</option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Fecha de Expiración *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="fechaExpiracion"
                    required
                    min={new Date().toISOString().split('T')[0]} // Mínimo hoy
                    value={formData.fechaExpiracion}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Actualizar" : "Crear"}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={handleCloseForm}
                >
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
              {viewMode === "activos" ? "Tarjetas Activas" : "Todas las Tarjetas"}
            </h5>
            <span className="badge bg-primary">{filtered.length}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-gift display-1 text-muted"></i>
              <h4 className="mt-3">No hay tarjetas registradas</h4>
              <button 
                className="btn btn-primary mt-2" 
                onClick={() => setShowForm(true)}
              >
                Crear Tarjeta
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Código</th>
                    <th>Monto Inicial</th>
                    <th>Moneda</th>
                    <th>Expiración</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id}>
                      <td><strong>{t.codigo}</strong></td>
                      <td>{t.montoInicial?.toFixed(2)}</td>
                      <td>{t.moneda}</td>
                      <td>
                        {t.fechaExpiracion ? new Date(t.fechaExpiracion).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            t.estado === "ACTIVA" || t.estado === "activa"
                              ? "bg-success"
                              : t.estado === "agotada" || t.estado === "AGOTADA"
                              ? "bg-warning"
                              : "bg-danger"
                          }`}
                        >
                          {t.estado?.toLowerCase() || "desconocido"}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleEdit(t)}
                            disabled={t.estado !== "ACTIVA" && t.estado !== "activa"}
                            title={t.estado !== "ACTIVA" && t.estado !== "activa" ? "Solo se pueden editar tarjetas activas" : "Editar"}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(t.id)}
                            disabled={t.estado !== "ACTIVA" && t.estado !== "activa"}
                            title={t.estado !== "ACTIVA" && t.estado !== "activa" ? "Solo se pueden anular tarjetas activas" : "Anular"}
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
    </div>
  );
}

export default TarjetasRegalo;