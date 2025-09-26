import React from "react";

const InventarioRow = ({ inventario, obtenerNombreSucursal, onEdit, onDelete, onAjustarStock }) => {
  return (
    <tr key={inventario.id} className="table-active">
      <td colSpan="4" className="text-end">
        <small>Inventario en {obtenerNombreSucursal(inventario.sucursalId)}:</small>
      </td>
      <td>
        <span className={`badge ${
          (parseInt(inventario.stockActual) || 0) <= (parseInt(inventario.stockMinimo) || 0) ? 'bg-warning' : 'bg-success'
        }`}>
          Stock: {inventario.stockActual} | Mín: {inventario.stockMinimo}
        </span>
      </td>
      <td>
        <small>
          Actualizado: {new Date(inventario.fechaActualizacion || inventario.updatedAt || Date.now()).toLocaleDateString()}
        </small>
      </td>
      <td className="text-end">
        <div className="btn-group" role="group">
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => onAjustarStock(inventario.id, 1)}
            title="Aumentar stock"
          >
            <i className="bi bi-plus"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-warning"
            onClick={() => onAjustarStock(inventario.id, -1)}
            title="Disminuir stock"
          >
            <i className="bi bi-dash"></i>
          </button>
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