import React from "react";

const ProductoDetailsModal = ({ producto, categorias, sucursales, obtenerNombreSucursal, onClose }) => {
  const obtenerNombreCategoria = (categoriaId) => {
    const categoria = categorias.find(c => 
      c.id === categoriaId || c.id.toString() === categoriaId?.toString()
    );
    return categoria?.nombreCategoria || 'Sin categoría';
  };

  // Función para determinar el estado del producto basado en stock
  const obtenerEstadoStock = () => {
    if (producto.stockTotal === 0) {
      return { texto: "SIN STOCK", clase: "bg-danger", descripcion: "No hay unidades disponibles en ninguna sucursal" };
    } else if (producto.tieneStockBajo) {
      return { texto: "STOCK BAJO", clase: "bg-warning", descripcion: "Alguna sucursal tiene stock por debajo del mínimo" };
    } else {
      return { texto: "DISPONIBLE", clase: "bg-success", descripcion: "Stock suficiente en todas las sucursales" };
    }
  };

  const estadoStock = obtenerEstadoStock();

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalles del Producto</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="detalle-producto">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Nombre:</strong> {producto.nombreProducto}</p>
                  <p><strong>Código de Barras:</strong> {producto.codigoBarras || 'No definido'}</p>
                  <p><strong>Descripción:</strong> {producto.descripcion || 'Sin descripción'}</p>
                  <p><strong>Precio Compra:</strong> ${producto.precioCompra}</p>
                  <p><strong>Precio Venta:</strong> ${producto.precioVenta}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Estado de Stock:</strong> 
                    <span className={`badge ${estadoStock.clase} ms-2`}>
                      {estadoStock.texto}
                    </span>
                    <br />
                    <small className="text-muted">{estadoStock.descripcion}</small>
                  </p>
                  
                  <p><strong>Stock Total:</strong> {producto.stockTotal} unidades</p>
                  <p><strong>Destacado:</strong> {producto.destacado ? 'Sí' : 'No'}</p>
                  <p><strong>Activo:</strong> {producto.activo !== false ? 'Sí' : 'No'}</p>
                  <p><strong>Categoría:</strong> {obtenerNombreCategoria(producto.categoriaId)}</p>
                </div>
              </div>

              <hr />
              <h6>Inventario por Sucursal:</h6>
              {producto.inventario && producto.inventario.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Sucursal</th>
                        <th>Stock Actual</th>
                        <th>Stock Mínimo</th>
                        <th>Estado</th>
                        <th>Diferencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {producto.inventario.map(inv => {
                        const stockActual = parseInt(inv.stockActual) || 0;
                        const stockMinimo = parseInt(inv.stockMinimo) || 0;
                        const diferencia = stockActual - stockMinimo;
                        const tieneStockBajo = stockActual <= stockMinimo;
                        
                        return (
                          <tr key={inv.id}>
                            <td>{obtenerNombreSucursal(inv.sucursalId)}</td>
                            <td>{stockActual}</td>
                            <td>{stockMinimo}</td>
                            <td>
                              <span className={`badge ${
                                tieneStockBajo ? 'bg-warning' : 'bg-success'
                              }`}>
                                {tieneStockBajo ? 'Stock Bajo' : 'Normal'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                diferencia < 0 ? 'bg-danger' : 
                                diferencia === 0 ? 'bg-warning' : 'bg-success'
                              }`}>
                                {diferencia >= 0 ? `+${diferencia}` : diferencia}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No hay inventario registrado para este producto.</p>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetailsModal;