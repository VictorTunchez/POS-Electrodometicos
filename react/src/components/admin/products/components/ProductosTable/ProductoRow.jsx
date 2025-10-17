import React from "react";

const ProductoRow = ({ 
  producto, 
  selectedSucursal, 
  obtenerNombreSucursal, 
  onEdit, 
  onDelete, 
  onRestore, 
  onViewDetails 
}) => {
  
  // Función para determinar el estado visual basado en el stock
  const obtenerEstadoVisual = () => {
    if (producto.stockTotal === 0) {
      return { texto: "SIN STOCK", clase: "bg-danger" };
    } else if (producto.tieneStockBajo) {
      return { texto: "STOCK BAJO", clase: "bg-warning" };
    } else {
      return { texto: "DISPONIBLE", clase: "bg-success" };
    }
  };

  // Función para formatear precio
  const formatearPrecio = (precio) => {
    if (!precio) return "N/A";
    return `Q${parseFloat(precio).toFixed(2)}`;
  };

  // Obtener precio principal para mostrar (minorista)
  const obtenerPrecioPrincipal = () => {
    return producto.precioMinorista || producto.precios?.find(p => p.tipoPrecio === 'MINORISTA' && p.activo)?.precio;
  };

  const estadoVisual = obtenerEstadoVisual();
  const precioPrincipal = obtenerPrecioPrincipal();

  return (
    <tr className={!producto.activo ? 'table-secondary' : ''}>
      <td>
        <div className="d-flex align-items-center">
          {producto.imagen && (
            <img
              src={producto.imagen}
              alt={producto.nombreProducto}
              className="me-3 rounded"
              style={{width: '40px', height: '40px', objectFit: 'cover'}}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div>
            <strong>{producto.nombreProducto}</strong>
            {producto.codigoBarras && (
              <div><small className="text-muted">Cód: {producto.codigoBarras}</small></div>
            )}
            {producto.unidadMedidaAbreviatura && (
              <div><small className="text-muted">Unidad: {producto.unidadMedidaAbreviatura}</small></div>
            )}
            {selectedSucursal !== "TODAS" && !producto.tieneInventarioEnSucursal && (
              <span className="badge bg-warning badge-sm">Sin inventario aquí</span>
            )}
          </div>
        </div>
      </td>
      
      <td>
        <div>
          <small className="text-muted">Compra: Q{producto.costoPromedio}</small>
          <br />
          <strong>Venta: {formatearPrecio(precioPrincipal)}</strong>
          {producto.margenDefault && (
            <div><small className="text-muted">Margen: {producto.margenDefault}%</small></div>
          )}
        </div>
      </td>
      
      <td>
        <span className="badge bg-info">{producto.nombreCategoria}</span>
        {producto.unidadCompraAbreviatura && (
          <div><small className="text-muted">Compra: {producto.unidadCompraAbreviatura}</small></div>
        )}
      </td>
      
      <td>
        <span className={`badge ${estadoVisual.clase}`}>
          {estadoVisual.texto}
        </span>
        {producto.destacado && <i className="bi bi-star-fill text-warning ms-1"></i>}
      </td>
      
      <td>
        {producto.inventario.length === 0 ? (
          <span className="text-muted fst-italic">Sin inventario</span>
        ) : (
          <div className="inventario-list">
            {(selectedSucursal === "TODAS" 
              ? producto.inventario 
              : producto.inventario.filter(inv => 
                  inv.sucursalId?.toString() === selectedSucursal.toString()
                )
            ).map(inv => (
              <div key={inv.id} className="d-flex justify-content-between align-items-center mb-1">
                <span>{obtenerNombreSucursal(inv.sucursalId)}:</span>
                <span className={`badge ${
                  (parseFloat(inv.stockActual) || 0) <= (parseFloat(inv.stockMinimo) || 0) ? 'bg-warning' : 'bg-success'
                }`}>
                  {parseFloat(inv.stockActual).toFixed(2)} / {parseFloat(inv.stockMinimo).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </td>
      
      <td>
        <span className={`badge ${
          producto.stockTotal === 0 ? 'bg-danger' :
          producto.tieneStockBajo ? 'bg-warning' : 'bg-success'
        }`}>
          {parseFloat(producto.stockTotal).toFixed(2)} unidades
        </span>
      </td>
      
      <td className="text-end">
        <div className="btn-group" role="group">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => onViewDetails(producto.id)}
            title="Ver detalles"
          >
            <i className="bi bi-eye"></i>
          </button>
          
          {producto.activo !== false ? (
            <>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => onEdit(producto)}
                title="Editar producto"
              >
                <i className="bi bi-pencil"></i>
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => onDelete(producto.id)}
                title="Eliminar producto"
              >
                <i className="bi bi-trash"></i>
              </button>
            </>
          ) : (
            <button
              className="btn btn-sm btn-outline-success"
              onClick={() => onRestore(producto.id)}
              title="Restaurar producto"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ProductoRow;