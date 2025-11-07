import React from "react";

function TrasladosList({ 
  traslados, 
  loading, 
  onCompletar, 
  onCancelar, 
  onRechazar, 
  onViewDetails 
}) {

  const getEstadoBadge = (estado) => {
    const estados = {
      PENDIENTE: { class: "warning", text: "Pendiente" },
      COMPLETADO: { class: "success", text: "Completado" },
      CANCELADO: { class: "danger", text: "Cancelado" },
      RECHAZADO: { class: "secondary", text: "Rechazado" }
    };
    
    const estadoInfo = estados[estado] || { class: "secondary", text: estado };
    return <span className={`badge bg-${estadoInfo.class}`}>{estadoInfo.text}</span>;
  };

  const getAccionesDisponibles = (traslado) => {
    const acciones = [];
    
    if (traslado.estado === "PENDIENTE") {
      acciones.push(
        {
          label: "Completar",
          icon: "bi-check-circle",
          class: "success",
          onClick: () => onCompletar(traslado.id)
        },
        {
          label: "Cancelar",
          icon: "bi-x-circle",
          class: "danger",
          onClick: () => onCancelar(traslado.id)
        }
      );
    }
    
    // Siempre disponible
    acciones.push({
      label: "Detalles",
      icon: "bi-eye",
      class: "info",
      onClick: () => onViewDetails(traslado)
    });
    
    return acciones;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 mb-0">Cargando traslados...</p>
        </div>
      </div>
    );
  }

  if (traslados.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-5">
            <i className="bi bi-arrow-left-right display-1 text-muted"></i>
            <h4 className="mt-3">No hay traslados registrados</h4>
            <p className="text-muted">Comienza creando tu primer traslado entre sucursales</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="card-title mb-0">Traslados Registrados</h5>
          <span className="badge bg-primary">{traslados.length} traslados</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Productos</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {traslados.map(traslado => (
                <tr key={traslado.id} className={`traslado-row estado-${traslado.estado.toLowerCase()}`}>
                  <td>
                    <strong>#{traslado.id}</strong>
                  </td>
                  <td>
                    <div className="sucursal-info">
                      <div className="fw-medium">{traslado.nombreSucursalOrigen}</div>
                    </div>
                  </td>
                  <td>
                    <div className="sucursal-info">
                      <div className="fw-medium">{traslado.nombreSucursalDestino}</div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark">
                      {traslado.detalles?.length || 0} productos
                    </span>
                  </td>
                  <td>
                    <div className="user-info">
                      <div>{traslado.nombreUsuario}</div>
                    </div>
                  </td>
                  <td>
                    <small className="text-muted">{formatFecha(traslado.fechaTraslado)}</small>
                  </td>
                  <td>
                    {getEstadoBadge(traslado.estado)}
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      {getAccionesDisponibles(traslado).map((accion, index) => (
                        <button
                          key={index}
                          className={`btn btn-outline-${accion.class}`}
                          onClick={accion.onClick}
                          title={accion.label}
                        >
                          <i className={accion.icon}></i>
                        </button>
                      ))}
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
}

export default TrasladosList;