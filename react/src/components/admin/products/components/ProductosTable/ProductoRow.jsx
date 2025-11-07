import React from "react";

const ProductoRow = ({ 
  producto, 
  selectedSucursal, 
  obtenerNombreSucursal, 
  onEdit, 
  onDelete, 
  onRestore, 
  onViewDetails,
  onToggleExpand,
  isExpanded
}) => {
  
  const obtenerEstadoVisual = () => {
    if (producto.stockTotal === 0) {
      return { texto: "SIN STOCK", clase: "bg-danger" };
    } else if (producto.tieneStockBajo) {
      return { texto: "STOCK BAJO", clase: "bg-warning" };
    } else {
      return { texto: "DISPONIBLE", clase: "bg-success" };
    }
  };

  const formatearPrecio = (precio) => {
    if (!precio) return "N/A";
    return `Q${parseFloat(precio).toFixed(2)}`;
  };

  // Obtener precio principal sin optional chaining
  const obtenerPrecioPrincipal = () => {
    if (producto.precioMinorista) {
      return producto.precioMinorista;
    }
    if (producto.precios && Array.isArray(producto.precios)) {
      const precioMinorista = producto.precios.find(p => p.tipoPrecio === 'MINORISTA' && p.activo);
      return precioMinorista ? precioMinorista.precio : null;
    }
    return null;
  };

  const estadoVisual = obtenerEstadoVisual();
  const precioPrincipal = obtenerPrecioPrincipal();

  // Encontrar inventario de la sucursal actual sin optional chaining
  const inventarioActual = selectedSucursal !== "TODAS" 
    ? producto.inventario.find(inv => {
        if (inv.sucursalId) {
          return inv.sucursalId.toString() === selectedSucursal.toString();
        }
        return false;
      })
    : null;

  return (
    <tr className={`${!producto.activo ? 'table-secondary' : ''} product-row`}>
      {/* Botón expandir */}
      <td>
        <button
          className={`btn btn-sm btn-outline-secondary expand-btn ${isExpanded ? 'expanded' : ''}`}
          onClick={onToggleExpand}
          disabled={producto.inventario.length === 0}
          title="Ver inventario por sucursal"
        >
          <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'}`}></i>
        </button>
      </td>

      {/* Información del producto */}
      <td>
        <div className="d-flex align-items-center">
          {producto.imagen && (
            <img
              src={producto.imagen}
              alt={producto.nombreProducto}
              className="me-3 rounded product-image"
              onError={(e) => {
                e.target.style.display = 'none';
                // Sin optional chaining
                const nextSibling = e.target.nextElementSibling;
                if (nextSibling) {
                  nextSibling.style.display = 'flex';
                }
              }}
            />
          )}
          <div 
            className="product-image-placeholder me-3"
            style={{ display: producto.imagen ? 'none' : 'flex' }}
          >
            <i className="bi bi-box text-muted"></i>
          </div>
          <div className="product-info">
            <div className="product-name">{producto.nombreProducto}</div>
            <div className="product-details">
              {producto.codigoBarras && (
                <span className="text-muted me-2">Cód: {producto.codigoBarras}</span>
              )}
              {producto.unidadMedidaAbreviatura && (
                <span className="text-muted">Unidad: {producto.unidadMedidaAbreviatura}</span>
              )}
            </div>
            {selectedSucursal !== "TODAS" && !producto.tieneInventarioEnSucursal && (
              <span className="badge bg-warning badge-sm mt-1">Sin inventario aquí</span>
            )}
          </div>
        </div>
      </td>
      
      {/* Precios */}
      <td>
        <div className="price-info">
          <div className="price-compra">
            <small className="text-muted">Compra: </small>
            <span className="text-muted">Q{producto.costoPromedio}</span>
          </div>
          <div className="price-venta">
            <strong>{formatearPrecio(precioPrincipal)}</strong>
          </div>
          {producto.margenDefault && (
            <div className="price-margin">
              <small className="text-muted">Margen: {producto.margenDefault}%</small>
            </div>
          )}
        </div>
      </td>
      
      {/* Categoría */}
      <td>
        <div className="category-info">
          <span className="badge bg-info category-badge">{producto.nombreCategoria}</span>
          {producto.unidadCompraAbreviatura && (
            <small className="text-muted d-block mt-1">Compra: {producto.unidadCompraAbreviatura}</small>
          )}
        </div>
      </td>
      
      {/* Estado */}
      <td>
        <div className="status-info">
          <span className={`badge ${estadoVisual.clase} status-badge`}>
            {estadoVisual.texto}
          </span>
          {producto.destacado && (
            <i className="bi bi-star-fill text-warning ms-1" title="Producto destacado"></i>
          )}
        </div>
      </td>
      
      {/* Stock Total */}
      <td>
        <div className="stock-info">
          <span className={`badge ${
            producto.stockTotal === 0 ? 'bg-danger' :
            producto.tieneStockBajo ? 'bg-warning' : 'bg-success'
          } stock-badge`}>
            {parseFloat(producto.stockTotal).toFixed(2)} {producto.unidadMedidaAbreviatura}
          </span>
          {inventarioActual && (
            <small className="text-muted d-block mt-1">
              En esta sucursal: {parseFloat(inventarioActual.stockActual).toFixed(2)}
            </small>
          )}
        </div>
      </td>
      
      {/* Acciones */}
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