import React from "react";

function UsuariosTable({
  filteredUsuarios,
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
  );
}

export default UsuariosTable;