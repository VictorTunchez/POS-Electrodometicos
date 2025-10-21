import React from "react";

const InventarioExpandible = ({
  producto,
  selectedSucursal,
  obtenerNombreSucursal,
  onEditInventario,
  onDeleteInventario,
  onAjustarInventarioSucursal,
  onViewMovimientosSucursal
}) => {
  const obtenerEstadoStock = (stockActual, stockMinimo) => {
    stockActual = parseFloat(stockActual) || 0;
    stockMinimo = parseFloat(stockMinimo) || 0;
    
    if (stockActual === 0) {
      return { texto: "SIN STOCK", clase: "bg-danger", icono: "bi-x-circle" };
    } else if (stockActual <= stockMinimo) {
      return { texto: "STOCK BAJO", clase: "bg-warning", icono: "bi-exclamation-triangle" };
    } else {
      return { texto: "NORMAL", clase: "bg-success", icono: "bi-check-circle" };
    }
  };

  // Filtrar inventarios sin optional chaining
  const inventarios = selectedSucursal === "TODAS" 
    ? producto.inventario 
    : producto.inventario.filter(inv => {
        if (inv.sucursalId) {
          return inv.sucursalId.toString() === selectedSucursal.toString();
        }
        return false;
      });

  if (inventarios.length === 0) {
    return (
      <tr className="inventory-expanded">
        <td colSpan="7" className="bg-light">
          <div className="text-center py-3 text-muted">
            <i className="bi bi-inbox display-6"></i>
            <p className="mt-2 mb-0">No hay inventario registrado para este producto</p>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="inventory-expanded">
      <td colSpan="7" className="p-0">
        <div className="inventory-section bg-light">
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">
                <i className="bi bi-clipboard-data me-2"></i>
                Inventario por Sucursal - {producto.nombreProducto}
              </h6>
              <span className="badge bg-secondary">{inventarios.length} sucursales</span>
            </div>
            
            <div className="row g-3">
              {inventarios.map((inventario) => {
                const estado = obtenerEstadoStock(inventario.stockActual, inventario.stockMinimo);
                
                return (
                  <div key={inventario.id} className="col-xl-4 col-lg-6 col-md-6">
                    <div className="card inventory-card h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-0">
                            {obtenerNombreSucursal(inventario.sucursalId)}
                          </h6>
                          <span className={`badge ${estado.clase}`}>
                            <i className={`bi ${estado.icono} me-1`}></i>
                            {estado.texto}
                          </span>
                        </div>
                        
                        <div className="inventory-stats">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted">Stock Actual:</span>
                            <strong className="fs-6">{parseFloat(inventario.stockActual).toFixed(2)}</strong>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted">Stock Mínimo:</span>
                            <span className="text-muted">{parseFloat(inventario.stockMinimo).toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="inventory-actions">
                          <div className="btn-group w-100" role="group">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => onViewMovimientosSucursal(inventario)}
                              title="Ver movimientos"
                            >
                              <i className="bi bi-list-check"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => onAjustarInventarioSucursal(inventario)}
                              title="Ajustar inventario"
                            >
                              <i className="bi bi-plus-slash-minus"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => onEditInventario(inventario)}
                              title="Editar inventario"
                            >
                              <i className="bi bi-clipboard-check"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => onDeleteInventario(inventario.id)}
                              title="Eliminar inventario"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                        
                        <div className="inventory-footer mt-2">
                          <small className="text-muted">
                            Actualizado: {new Date(
                              inventario.fechaActualizacion || inventario.updatedAt || Date.now()
                            ).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default InventarioExpandible;