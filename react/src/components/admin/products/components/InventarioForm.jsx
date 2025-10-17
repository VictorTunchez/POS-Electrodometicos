import React, { useState, useEffect } from "react";

const InventarioForm = ({ inventario, productos, sucursales, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    productoId: "",
    sucursalId: "",
    stockMinimo: 5 // Stock mínimo por defecto
  });

  useEffect(() => {
    if (inventario) {
      setFormData({
        productoId: inventario.productoId?.toString() || "",
        sucursalId: inventario.sucursalId?.toString() || "",
        stockMinimo: inventario.stockMinimo?.toString() || "5"
      });
    }
  }, [inventario]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // NOTA: stockActual siempre será 0 al crear/actualizar inventario
    onSubmit(formData);
  };

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">
          {inventario ? "Editar Inventario" : "Crear Nuevo Registro de Inventario"}
        </h5>
        <button className="btn-close" onClick={onCancel}></button>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="productoId" className="form-label">Producto *</label>
              <select
                className="form-select"
                id="productoId"
                name="productoId"
                value={formData.productoId}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione un producto</option>
                {productos.map(producto => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombreProducto} 
                    {producto.unidadMedidaAbreviatura && ` (${producto.unidadMedidaAbreviatura})`}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="sucursalId" className="form-label">Sucursal *</label>
              <select
                className="form-select"
                id="sucursalId"
                name="sucursalId"
                value={formData.sucursalId}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione una sucursal</option>
                {sucursales.map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombreSucursal}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="stockMinimo" className="form-label">Stock Mínimo *</label>
              <input
                type="number"
                className="form-control"
                id="stockMinimo"
                name="stockMinimo"
                value={formData.stockMinimo}
                onChange={handleInputChange}
                required
                min="0"
                step="0.0001"
              />
              <small className="text-muted">
                Stock mínimo de alerta. El stock actual se establecerá automáticamente en 0.
              </small>
            </div>
            <div className="col-md-6">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title">Información Importante</h6>
                  <p className="card-text small">
                    <strong>Stock Actual:</strong> Siempre comienza en 0<br/>
                    <strong>Modificación de Stock:</strong> Solo mediante compras o ventas<br/>
                    <strong>Stock Mínimo:</strong> Nivel de alerta para reposición
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button type="submit" className="btn btn-success">
              {inventario ? "Actualizar" : "Crear"}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventarioForm;