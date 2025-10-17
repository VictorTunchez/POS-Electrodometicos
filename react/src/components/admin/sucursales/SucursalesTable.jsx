import React from "react";

function SucursalesTable({
  filteredSucursales,
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
  );
}

export default SucursalesTable;