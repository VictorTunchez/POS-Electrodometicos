import React from "react";

const ProveedoresTable = ({
  proveedores,
  viewMode,
  onEditProveedor,
  onDeleteProveedor,
  onRestoreProveedor,
  onViewDetails
}) => {
  if (proveedores.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="bi bi-building-x display-1 text-muted"></i>
          <h4 className="mt-3">
            {viewMode === 'activos' 
              ? "No hay proveedores activos" 
              : "No hay proveedores registrados"}
          </h4>
          <p className="text-muted">
            {viewMode === 'activos' 
              ? "Todos los proveedores están inactivos o no hay registros." 
              : "Comienza agregando tu primer proveedor."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="card-title mb-0">
            {viewMode === 'activos' 
              ? "Proveedores Activos" 
              : "Todos los Proveedores"}
          </h5>
          <span className={`badge ${
            viewMode === 'activos' ? 'bg-success' : 'bg-primary'
          }`}>
            {proveedores.length} proveedores
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Razón Social</th>
                <th>Nombre Comercial</th>
                <th>NIT</th>
                <th>Ubicación</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((proveedor) => (
                <tr key={proveedor.id} className={!proveedor.activo ? "table-secondary" : ""}>
                  <td>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-building me-2 text-muted"></i>
                      <strong>{proveedor.razonSocial}</strong>
                    </div>
                  </td>
                  <td>{proveedor.nombreComercial || '-'}</td>
                  <td>
                    {proveedor.nit}
                  </td>
                  <td>
                    {proveedor.departamento || proveedor.municipio ? (
                      <div>
                        {proveedor.departamento && (
                          <div><small className="text-muted">{proveedor.departamento}</small></div>
                        )}
                        {proveedor.municipio && (
                          <div><small>{proveedor.municipio}</small></div>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {proveedor.contactoNombre ? (
                      <>
                        {proveedor.contactoNombre}
                        {proveedor.contactoTelefono && (
                          <div><small className="text-muted">{proveedor.contactoTelefono}</small></div>
                        )}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{proveedor.telefono || '-'}</td>
                  <td>
                    {proveedor.email ? (
                      <a href={`mailto:${proveedor.email}`} className="text-decoration-none">
                        {proveedor.email}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {proveedor.activo ? (
                      <span className="badge bg-success">
                        Activo
                      </span>
                    ) : (
                      <span className="badge bg-danger">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="text-end">
                    <div className="btn-group" role="group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onViewDetails(proveedor.id)}
                        title="Ver detalles"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      
                      {proveedor.activo ? (
                        <>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => onEditProveedor(proveedor)}
                            title="Editar proveedor"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onDeleteProveedor(proveedor.id)}
                            title="Eliminar proveedor"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => onRestoreProveedor(proveedor.id)}
                          title="Restaurar proveedor"
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
      </div>
    </div>
  );
};

export default ProveedoresTable;