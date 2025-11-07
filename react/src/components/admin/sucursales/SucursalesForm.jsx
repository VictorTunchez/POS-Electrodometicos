import React from "react";

function SucursalesForm({
  formData,
  editingId,
  handleInputChange,
  handleSubmit,
  cancelEdit
}) {
  return (
    <div id="form-section" className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">{editingId ? "Editar Sucursal" : "Crear Nueva Sucursal"}</h5>
        <button className="btn-close" onClick={cancelEdit} aria-label="Cerrar"></button>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="nombreSucursal" className="form-label">Nombre de la Sucursal *</label>
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
              <label htmlFor="direccion" className="form-label">Dirección *</label>
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
              <label htmlFor="telefono" className="form-label">Teléfono *</label>
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
  );
}

export default SucursalesForm;