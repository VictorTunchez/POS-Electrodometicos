import React, { useState, useEffect } from "react";

const ProductoForm = ({ producto, categorias, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombreProducto: "",
    codigoBarras: "",
    descripcion: "",
    precioCompra: "",
    precioVenta: "",
    imagen: "",
    categoriaId: "",
    destacado: false
  });

  useEffect(() => {
    if (producto) {
      setFormData({
        nombreProducto: producto.nombreProducto || "",
        codigoBarras: producto.codigoBarras || "",
        descripcion: producto.descripcion || "",
        precioCompra: producto.precioCompra?.toString() || "",
        precioVenta: producto.precioVenta?.toString() || "",
        imagen: producto.imagen || "",
        categoriaId: producto.categoriaId?.toString() || "",
        destacado: producto.destacado || false
      });
    }
  }, [producto]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">{producto ? "Editar Producto" : "Crear Nuevo Producto"}</h5>
        <button className="btn-close" onClick={onCancel}></button>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="nombreProducto" className="form-label">Nombre del Producto *</label>
              <input
                type="text"
                className="form-control"
                id="nombreProducto"
                name="nombreProducto"
                value={formData.nombreProducto}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="codigoBarras" className="form-label">Código de Barras</label>
              <input
                type="text"
                className="form-control"
                id="codigoBarras"
                name="codigoBarras"
                value={formData.codigoBarras}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="precioCompra" className="form-label">Precio de Compra *</label>
              <input
                type="number"
                className="form-control"
                id="precioCompra"
                name="precioCompra"
                value={formData.precioCompra}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="precioVenta" className="form-label">Precio de Venta *</label>
              <input
                type="number"
                className="form-control"
                id="precioVenta"
                name="precioVenta"
                value={formData.precioVenta}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="categoriaId" className="form-label">Categoría *</label>
              <select
                className="form-select"
                id="categoriaId"
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombreCategoria}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-12">
              <label htmlFor="descripcion" className="form-label">Descripción</label>
              <textarea
                className="form-control"
                id="descripcion"
                name="descripcion"
                rows="3"
                value={formData.descripcion}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="col-md-6">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="destacado"
                  name="destacado"
                  checked={formData.destacado}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="destacado">
                  Producto destacado
                </label>
              </div>
            </div>
            
            <div className="col-md-6">
              <label htmlFor="imagen" className="form-label">URL de Imagen (Opcional)</label>
              <input
                type="url"
                className="form-control"
                id="imagen"
                name="imagen"
                value={formData.imagen}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button type="submit" className="btn btn-primary">
              {producto ? "Actualizar" : "Crear"}
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

export default ProductoForm;