import React from "react";

function UsuariosForm({
  formData,
  editingId,
  roles,
  sucursales,
  handleInputChange,
  handleSubmit,
  cancelEdit,
  onOpenQuickRolModal
}) {
  const handleRolChange = (e) => {
    const value = e.target.value;
    if (value === "create_new_rol") {
      onOpenQuickRolModal();
      // Mantener el valor anterior del rol seleccionado
      e.target.value = formData.rolId || "";
    } else {
      handleInputChange(e);
    }
  };

  return (
    <div id="form-section" className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
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
                minLength={editingId ? 0 : 8}
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
            
            {/* Campo de Rol con opción en el selector */}
            <div className="col-md-6">
              <label htmlFor="rolId" className="form-label">Rol *</label>
              <select
                className="form-select"
                id="rolId"
                name="rolId"
                value={formData.rolId}
                onChange={handleRolChange}
                required
              >
                <option value="">Seleccionar rol</option>
                {roles.filter(rol => rol.activo).map(rol => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombreRol}
                  </option>
                ))}
                <option value="create_new_rol" className="text-primary fw-bold">
                  + Crear nuevo rol...
                </option>
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
  );
}

export default UsuariosForm;