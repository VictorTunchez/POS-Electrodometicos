import React, { useState } from "react";
import ProductoRow from "./ProductoRow";
import InventarioExpandible from "./InventarioExpandible";

const ProductosTable = ({
  productos,
  selectedSucursal,
  sucursales,
  obtenerNombreSucursal,
  onEditProducto,
  onDeleteProducto,
  onRestoreProducto,
  onEditInventario,
  onDeleteInventario,
  onViewDetails,
  onAjustarInventarioSucursal,
  onViewMovimientosSucursal
}) => {
  const [productoExpandido, setProductoExpandido] = useState(null);

  const toggleExpandirProducto = (productoId) => {
    setProductoExpandido(productoExpandido === productoId ? null : productoId);
  };

  if (productos.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-5">
            <i className="bi bi-box display-1 text-muted"></i>
            <h4 className="mt-3">
              {selectedSucursal === "TODAS" 
                ? "No hay productos que coincidan con los filtros" 
                : `No hay productos con inventario en ${obtenerNombreSucursal(selectedSucursal)}`
              }
            </h4>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="card-title mb-1">
              Productos e Inventario
              {selectedSucursal !== "TODAS" && ` - ${obtenerNombreSucursal(selectedSucursal)}`}
            </h5>
            <div className="d-flex gap-2 align-items-center">
              <span className="badge bg-primary">{productos.length} productos</span>
              <small className="text-muted">
                {selectedSucursal === "TODAS" 
                  ? "Mostrando todas las sucursales" 
                  : `Filtrado por sucursal actual`
                }
              </small>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-products">
            <thead className="table-light">
              <tr>
                <th width="50"></th>
                <th>Producto</th>
                <th>Precios</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Stock Total</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <React.Fragment key={producto.id}>
                  <ProductoRow
                    producto={producto}
                    selectedSucursal={selectedSucursal}
                    obtenerNombreSucursal={obtenerNombreSucursal}
                    onEdit={onEditProducto}
                    onDelete={onDeleteProducto}
                    onRestore={onRestoreProducto}
                    onViewDetails={onViewDetails}
                    onToggleExpand={() => toggleExpandirProducto(producto.id)}
                    isExpanded={productoExpandido === producto.id}
                  />
                  
                  {/* Fila expandible de inventario */}
                  {productoExpandido === producto.id && (
                    <InventarioExpandible
                      producto={producto}
                      selectedSucursal={selectedSucursal}
                      obtenerNombreSucursal={obtenerNombreSucursal}
                      onEditInventario={onEditInventario}
                      onDeleteInventario={onDeleteInventario}
                      onAjustarInventarioSucursal={onAjustarInventarioSucursal}
                      onViewMovimientosSucursal={onViewMovimientosSucursal}
                    />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductosTable;