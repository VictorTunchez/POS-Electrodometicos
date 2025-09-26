import React from "react";
import ProductoRow from "./ProductoRow";
import InventarioRow from "./InventarioRow";

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
  onAjustarStock,
  onViewDetails
}) => {
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
          <h5 className="card-title mb-0">
            Productos e Inventario
            {selectedSucursal !== "TODAS" && ` - Sucursal: ${obtenerNombreSucursal(selectedSucursal)}`}
          </h5>
          <span className="badge bg-primary">{productos.length} productos</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Producto</th>
                <th>Precios</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Inventario por Sucursal</th>
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
                  />
                  
                  {/* Filas de inventario */}
                  {(selectedSucursal === "TODAS" 
                    ? producto.inventario 
                    : producto.inventario.filter(inv => 
                        inv.sucursalId?.toString() === selectedSucursal.toString()
                      )
                  ).map(inv => (
                    <InventarioRow
                      key={inv.id}
                      inventario={inv}
                      obtenerNombreSucursal={obtenerNombreSucursal}
                      onEdit={onEditInventario}
                      onDelete={onDeleteInventario}
                      onAjustarStock={onAjustarStock}
                    />
                  ))}
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