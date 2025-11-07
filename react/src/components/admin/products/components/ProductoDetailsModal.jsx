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

  // Función para formatear precio
  const formatearPrecio = (precio) => {
    if (!precio) return "N/A";
    return `Q${parseFloat(precio).toFixed(2)}`;
  };

  // Función para obtener precio por tipo
  const obtenerPrecioPorTipo = (tipoPrecio) => {
    if (!producto.precios || !Array.isArray(producto.precios)) {
      return null;
    }
    
    const precio = producto.precios.find(p => 
      p.tipoPrecio === tipoPrecio && p.activo !== false
    );
    
    return precio || null;
  };

  const estadoStock = obtenerEstadoStock();
  const precioMinorista = obtenerPrecioPorTipo("MINORISTA");
  const precioMayorista = obtenerPrecioPorTipo("MAYORISTA");
  const precioOferta = obtenerPrecioPorTipo("OFERTA");
  const precioCosto = obtenerPrecioPorTipo("COSTO");

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
                  <p><strong>Costo Promedio:</strong> Q{producto.costoPromedio}</p>
                  
                  {/* NUEVO: Información de unidades de medida */}
                  <p><strong>Unidad de Venta:</strong> 
                    {producto.unidadMedidaNombre ? ` ${producto.unidadMedidaNombre} (${producto.unidadMedidaAbreviatura})` : ' No definida'}
                  </p>
                  
                  {producto.unidadCompraNombre && (
                    <p><strong>Unidad de Compra:</strong> 
                      {` ${producto.unidadCompraNombre} (${producto.unidadCompraAbreviatura})`}
                      {producto.factorConversion && ` - Factor: ${producto.factorConversion}`}
                    </p>
                  )}
                </div>
                <div className="col-md-6">
                  <p><strong>Estado de Stock:</strong> 
                    <span className={`badge ${estadoStock.clase} ms-2`}>
                      {estadoStock.texto}
                    </span>
                    <br />
                    <small className="text-muted">{estadoStock.descripcion}</small>
                  </p>

                  {/* NUEVO: Información de Stock */}
                  {producto.stockTotal && (
                    <p><strong>Stock Total:</strong> {parseFloat(producto.stockTotal).toFixed(2)} unidades</p>
                  )}

                  {/* NUEVO: Información de márgenes */}
                  {producto.margenDefault && (
                    <p><strong>Margen por Defecto:</strong> {producto.margenDefault}%</p>
                  )}
                  
                  <p><strong>Destacado:</strong> {producto.destacado ? 'Sí' : 'No'}</p>
                  <p><strong>Activo:</strong> {producto.activo !== false ? 'Sí' : 'No'}</p>
                  <p><strong>Categoría:</strong> {obtenerNombreCategoria(producto.categoriaId)}</p>
                </div>
              </div>

              <hr />
              
              {/* NUEVO: Sección de Precios */}
              <h6>Precios Configurados:</h6>
              {producto.precios && producto.precios.length > 0 ? (
                <div className="table-responsive mb-4">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Tipo de Precio</th>
                        <th>Unidad</th>
                        <th>Precio</th>
                        <th>Cantidad Mínima</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {producto.precios.filter(p => p.activo !== false).map(precio => (
                        <tr key={precio.id}>
                          <td>
                            <span className={`badge ${
                              precio.tipoPrecio === 'MINORISTA' ? 'bg-primary' :
                              precio.tipoPrecio === 'MAYORISTA' ? 'bg-success' :
                              precio.tipoPrecio === 'OFERTA' ? 'bg-warning' : 'bg-secondary'
                            }`}>
                              {precio.tipoPrecio}
                            </span>
                          </td>
                          <td>{precio.unidadMedidaAbreviatura || 'UND'}</td>
                          <td><strong>{formatearPrecio(precio.precio)}</strong></td>
                          <td>{precio.minimoCantidad}</td>
                          <td>
                            <span className={`badge ${precio.activo ? 'bg-success' : 'bg-secondary'}`}>
                              {precio.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay precios configurados para este producto.</p>
              )}

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
                        <th>Última Actualización</th>
                      </tr>
                    </thead>
                    <tbody>
                      {producto.inventario.map(inv => {
                        const stockActual = parseFloat(inv.stockActual) || 0;
                        const stockMinimo = parseFloat(inv.stockMinimo) || 0;
                        const diferencia = stockActual - stockMinimo;
                        const tieneStockBajo = stockActual <= stockMinimo;
                        
                        return (
                          <tr key={inv.id}>
                            <td>{obtenerNombreSucursal(inv.sucursalId)}</td>
                            <td>{stockActual.toFixed(2)}</td>
                            <td>{stockMinimo.toFixed(2)}</td>
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
                                {diferencia >= 0 ? `+${diferencia.toFixed(2)}` : diferencia.toFixed(2)}
                              </span>
                            </td>
                            <td>
                              <small>
                                {new Date(inv.fechaActualizacion || inv.updatedAt || Date.now()).toLocaleDateString()}
                              </small>
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