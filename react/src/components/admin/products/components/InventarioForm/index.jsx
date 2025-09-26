import React, { useState, useEffect } from "react";

const InventarioForm = ({ inventario, productos, sucursales, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    productoId: "",
    sucursalId: "",
    stockActual: 0,
    stockMinimo: 0
  });

  useEffect(() => {
    if (inventario) {
      setFormData({
        productoId: inventario.productoId?.toString() || "",
        sucursalId: inventario.sucursalId?.toString() || "",
        stockActual: inventario.stockActual?.toString() || "0",
        stockMinimo: inventario.stockMinimo?.toString() || "0"
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
              <label htmlFor="stockActual" className="form-label">Stock Actual *</label>
              <input
                type="number"
                className="form-control"
                id="stockActual"
                name="stockActual"
                value={formData.stockActual}
                onChange={handleInputChange}
                required
                min="0"
              />
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
              />
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