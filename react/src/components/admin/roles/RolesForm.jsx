import React from "react";

function RolesForm({
  formData,
  editingId,
  selectedPermisos,
  permisos,
  groupedPermisos,
  handleInputChange,
  handlePermisoChange,
  handleCategoriaChange,
  handleSubmit,
  cancelEdit,
  isCategoriaCompleta,
  isCategoriaParcial
}) {
  return (
    <div id="form-section" className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
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
  );
}

export default RolesForm;