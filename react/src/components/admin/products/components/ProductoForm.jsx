import React, { useState, useEffect } from "react";

const ProductoForm = ({ producto, categorias, unidadesMedida, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombreProducto: "",
    codigoBarras: "",
    descripcion: "",
    imagen: "",
    categoriaId: "",
    unidadMedidaId: "",
    unidadCompraId: "",
    factorConversion: "",
    margenDefault: "30", // 30% por defecto
    destacado: false,
    generarPreciosAutomaticos: true
  });

  const [mostrarCamposCompra, setMostrarCamposCompra] = useState(false);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (producto) {
      setFormData({
        nombreProducto: producto.nombreProducto || "",
        codigoBarras: producto.codigoBarras || "",
        descripcion: producto.descripcion || "",
        imagen: producto.imagen || "",
        categoriaId: producto.categoriaId?.toString() || "",
        unidadMedidaId: producto.unidadMedidaId?.toString() || "",
        unidadCompraId: producto.unidadCompraId?.toString() || "",
        factorConversion: producto.factorConversion?.toString() || "",
        margenDefault: producto.margenDefault?.toString() || "30",
        destacado: producto.destacado || false,
        generarPreciosAutomaticos: true // Por defecto true al editar también
      });
      setMostrarCamposCompra(!!producto.unidadCompraId);
    }
  }, [producto]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleUnidadCompraChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      unidadCompraId: value
    });
    setMostrarCamposCompra(!!value);
    if (!value) {
      setFormData(prev => ({
        ...prev,
        factorConversion: ""
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validación de unidad de compra y factor de conversión
    if (formData.unidadCompraId && !formData.factorConversion) {
      nuevosErrores.factorConversion = "El factor de conversión es obligatorio cuando se selecciona unidad de compra";
    }

    // Validación de factor de conversión mayor a 0
    if (formData.factorConversion && parseFloat(formData.factorConversion) <= 0) {
      nuevosErrores.factorConversion = "El factor de conversión debe ser mayor a 0";
    }

    // Validación de margen
    if (formData.margenDefault && (parseFloat(formData.margenDefault) < 0 || parseFloat(formData.margenDefault) > 100)) {
      nuevosErrores.margenDefault = "El margen debe estar entre 0% y 100%";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    // Preparar datos para enviar
    const datosEnviar = {
      ...formData,
      categoriaId: parseInt(formData.categoriaId) || null,
      unidadMedidaId: parseInt(formData.unidadMedidaId) || null,
      unidadCompraId: formData.unidadCompraId ? parseInt(formData.unidadCompraId) : null,
      factorConversion: formData.factorConversion ? parseFloat(formData.factorConversion) : null,
      margenDefault: formData.margenDefault ? parseFloat(formData.margenDefault) : null,
      destacado: formData.destacado || false,
      generarPreciosAutomaticos: formData.generarPreciosAutomaticos !== false
    };

    onSubmit(datosEnviar);
  };

  // Filtrar unidades de medida para venta y compra
  const unidadesVenta = unidadesMedida.filter(u => u.tipo === 'VENTA' || u.tipo === 'AMBOS');
  const unidadesCompra = unidadesMedida.filter(u => u.tipo === 'COMPRA' || u.tipo === 'AMBOS');

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">{producto ? "Editar Producto" : "Crear Nuevo Producto"}</h5>
        <button className="btn-close" onClick={onCancel}></button>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Información Básica */}
            <div className="col-md-6">
              <label htmlFor="nombreProducto" className="form-label">
                Nombre del Producto *
              </label>
              <input
                type="text"
                className={`form-control ${errores.nombreProducto ? 'is-invalid' : ''}`}
                id="nombreProducto"
                name="nombreProducto"
                value={formData.nombreProducto}
                onChange={handleInputChange}
                required
              />
              {errores.nombreProducto && (
                <div className="invalid-feedback">{errores.nombreProducto}</div>
              )}
            </div>

            <div className="col-md-6">
              <label htmlFor="codigoBarras" className="form-label">
                Código de Barras
              </label>
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
              <label htmlFor="margenDefault" className="form-label">
                Margen por Defecto (%) *
              </label>
              <input
                type="number"
                className={`form-control ${errores.margenDefault ? 'is-invalid' : ''}`}
                id="margenDefault"
                name="margenDefault"
                value={formData.margenDefault}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                max="100"
              />
              {errores.margenDefault && (
                <div className="invalid-feedback">{errores.margenDefault}</div>
              )}
              <small className="text-muted">Margen de ganancia aplicado a los precios automáticos</small>
            </div>

            <div className="col-md-6">
              <label htmlFor="categoriaId" className="form-label">
                Categoría *
              </label>
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

            {/* Unidades de Medida */}
            <div className="col-md-6">
              <label htmlFor="unidadMedidaId" className="form-label">
                Unidad de de venta *
                {/* <small className="text-muted ms-1">→ Se usará para precio MINORISTA</small> */}
              </label>
              <select
                className="form-select"
                id="unidadMedidaId"
                name="unidadMedidaId"
                value={formData.unidadMedidaId}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione una unidad</option>
                {unidadesVenta.map(unidad => (
                  <option key={unidad.id} value={unidad.id}>
                    {unidad.nombre} ({unidad.abreviatura})
                  </option>
                ))}
              </select>
              <small className="text-muted">Unidad en la que se vende al por menor</small>
            </div>
            
            <div className="col-md-6">
              <label htmlFor="unidadCompraId" className="form-label">
                Unidad de Compra (Opcional)
                {/* <small className="text-muted ms-1">→ Se usará para precio MAYORISTA</small> */}
              </label>
              <select
                className="form-select"
                id="unidadCompraId"
                name="unidadCompraId"
                value={formData.unidadCompraId}
                onChange={handleUnidadCompraChange}
              >
                <option value="">No usar unidad de compra</option>
                {unidadesCompra.map(unidad => (
                  <option key={unidad.id} value={unidad.id}>
                    {unidad.nombre} ({unidad.abreviatura})
                  </option>
                ))}
              </select>
              <small className="text-muted">
                Unidad en la que se compra y vende al por mayor (si aplica)
              </small>
            </div>

            {mostrarCamposCompra && (
              <div className="col-md-6">
                <label htmlFor="factorConversion" className="form-label">
                  Factor de Conversión *
                </label>
                <input
                  type="number"
                  className={`form-control ${errores.factorConversion ? 'is-invalid' : ''}`}
                  id="factorConversion"
                  name="factorConversion"
                  value={formData.factorConversion}
                  onChange={handleInputChange}
                  step="0.0001"
                  min="0.0001"
                  placeholder="Ej: 1 caja = 12 unidades → 12"
                />
                {errores.factorConversion && (
                  <div className="invalid-feedback">{errores.factorConversion}</div>
                )}
                <small className="text-muted">
                  Cuantas unidades de venta hay en una unidad de compra. 
                  <br />
                  <strong>Ejemplo:</strong> Si 1 caja tiene 12 unidades, ingresa 12
                </small>
              </div>
            )}
            
            {/* Descripción */}
            <div className="col-12">
              <label htmlFor="descripcion" className="form-label">
                Descripción
              </label>
              <textarea
                className="form-control"
                id="descripcion"
                name="descripcion"
                rows="3"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción detallada del producto..."
              ></textarea>
            </div>

            {/* Información de Precios Automáticos */}
            {formData.generarPreciosAutomaticos && (
              <div className="col-12">
                <div className="alert alert-info">
                  <small>
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Se generarán precios automáticamente:</strong>
                    <ul className="mb-0 mt-2">
                      <li>
                        <strong>PRECIO MINORISTA</strong>: en {formData.unidadMedidaId ? 
                          unidadesVenta.find(u => u.id.toString() === formData.unidadMedidaId)?.abreviatura + 
                          ' (' + unidadesVenta.find(u => u.id.toString() === formData.unidadMedidaId)?.nombre + ')' 
                          : 'unidad de venta'} (cantidad mínima: 1)
                      </li>
                      {formData.unidadCompraId && (
                        <li>
                          <strong>PRECIO MAYORISTA</strong>: en {unidadesCompra.find(u => u.id.toString() === formData.unidadCompraId)?.abreviatura} 
                          (cantidad mínima: {formData.factorConversion || '?'})
                        </li>
                      )}
                      <li>
                        <strong>PRECIO COSTO</strong>: en {formData.unidadMedidaId ? 
                          unidadesVenta.find(u => u.id.toString() === formData.unidadMedidaId)?.abreviatura : 'unidad de venta'}
                      </li>
                    </ul>
                  </small>
                </div>
              </div>
            )}

            {/* Opciones */}
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
                  <strong>Producto destacado</strong>
                  <small className="text-muted d-block">Mostrar este producto como destacado en el catálogo</small>
                </label>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="generarPreciosAutomaticos"
                  name="generarPreciosAutomaticos"
                  checked={formData.generarPreciosAutomaticos}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="generarPreciosAutomaticos">
                  <strong>Generar precios automáticamente</strong>
                  <small className="text-muted d-block">
                    Calcular precios basados en el margen y unidades definidas
                  </small>
                </label>
              </div>
            </div>
            
            {/* Imagen */}
            <div className="col-md-6">
              <label htmlFor="imagen" className="form-label">
                URL de Imagen (Opcional)
              </label>
              <input
                type="url"
                className="form-control"
                id="imagen"
                name="imagen"
                value={formData.imagen}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <small className="text-muted">
                Enlace a la imagen del producto. Se recomienda una relación 1:1 (cuadrada)
              </small>
            </div>
          </div>

          {/* Botones */}
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {producto ? "Actualizar Producto" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductoForm;