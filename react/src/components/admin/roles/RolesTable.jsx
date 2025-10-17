import React from "react";

function RolesTable({
  filteredRoles,
  viewMode,
  handleViewDetails,
  handleEdit,
  handleDelete,
  handleRestore,
  setShowForm
}) {
  return (
    <div className="card">
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
  );
}

export default RolesTable;