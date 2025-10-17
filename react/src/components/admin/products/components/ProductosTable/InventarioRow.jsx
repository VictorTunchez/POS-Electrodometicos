import React from "react";

const InventarioRow = ({ inventario, obtenerNombreSucursal, onEdit, onDelete }) => {
  // Función para determinar el estado del stock
  const obtenerEstadoStock = () => {
    const stockActual = parseFloat(inventario.stockActual) || 0;
    const stockMinimo = parseFloat(inventario.stockMinimo) || 0;
    
    if (stockActual === 0) {
      return { texto: "SIN STOCK", clase: "bg-danger" };
    } else if (stockActual <= stockMinimo) {
      return { texto: "STOCK BAJO", clase: "bg-warning" };
    } else {
      return { texto: "NORMAL", clase: "bg-success" };
    }
  };

  const estadoStock = obtenerEstadoStock();

  return (
    <tr key={inventario.id} className="table-active">
      <td colSpan="3" className="text-end">
        <small>Inventario en {obtenerNombreSucursal(inventario.sucursalId)}:</small>
      </td>
      <td>
        <span className={`badge ${estadoStock.clase}`}>
          {estadoStock.texto}
        </span>
      </td>
      <td>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small>
              <strong>Actual:</strong> {parseFloat(inventario.stockActual).toFixed(2)}
            </small>
            <br />
            <small>
              <strong>Mínimo:</strong> {parseFloat(inventario.stockMinimo).toFixed(2)}
            </small>
          </div>
          {estadoStock.texto === "STOCK BAJO" && (
            <i className="bi bi-exclamation-triangle text-warning ms-2" title="Stock por debajo del mínimo"></i>
          )}
          {estadoStock.texto === "SIN STOCK" && (
            <i className="bi bi-x-circle text-danger ms-2" title="Sin stock disponible"></i>
          )}
        </div>
      </td>
      <td>
        <small>
          Actualizado: {new Date(inventario.fechaActualizacion || inventario.updatedAt || Date.now()).toLocaleDateString()}
        </small>
      </td>
      <td className="text-end">
        <div className="btn-group" role="group">
          <button
            className="btn btn-sm btn-outline-info"
            onClick={() => onEdit(inventario)}
            title="Editar inventario"
          >
            <i className="bi bi-clipboard-check"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(inventario.id)}
            title="Eliminar inventario"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default InventarioRow;