import React from "react";

const DetalleVentaCard = ({ 
  detalle, 
  index, 
  onChange, 
  onDelete, 
  productos, 
  unidadesMedida, 
  errors, 
  loading,
  obtenerPrecioParaUnidad,
  safeParseBigDecimal
}) => {
  
  const handleFieldChange = (field, value) => {
    onChange(index, field, value);
  };

  const productoSeleccionado = productos.find(p => p.id === parseInt(detalle.productoId));
  const preciosDisponibles = productoSeleccionado?.precios || [];
  
  // Filtrar unidades de medida que tienen precios configurados para este producto
  const unidadesConPrecio = unidadesMedida.filter(unidad => {
    return preciosDisponibles.some(precio => precio.unidadMedidaId === unidad.id);
  });

  return (
    <div className="card mb-3">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Producto #{index + 1}</h6>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(index)}
          disabled={loading}
        >
          <i className="bi bi-trash"></i>
        </button>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {/* Producto */}
          <div className="col-md-3">
            <label className="form-label">Producto *</label>
            <select
              className={`form-select ${errors[`detalle_${index}_producto`] ? 'is-invalid' : ''}`}
              value={detalle.productoId}
              onChange={(e) => handleFieldChange('productoId', e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Seleccionar producto</option>
              {productos.map(producto => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombreProducto} ({producto.codigoBarras})
                </option>
              ))}
            </select>
            {errors[`detalle_${index}_producto`] && (
              <div className="invalid-feedback">{errors[`detalle_${index}_producto`]}</div>
            )}
          </div>

          {/* Unidad Medida */}
          <div className="col-md-2">
            <label className="form-label">Unidad Medida *</label>
            <select
              className={`form-select ${errors[`detalle_${index}_unidad`] ? 'is-invalid' : ''}`}
              value={detalle.unidadMedidaId}
              onChange={(e) => handleFieldChange('unidadMedidaId', e.target.value)}
              required
              disabled={loading || !detalle.productoId}
            >
              <option value="">Seleccionar unidad</option>
              {unidadesConPrecio.map(unidad => {
                const precioInfo = preciosDisponibles.find(p => p.unidadMedidaId === unidad.id);
                return (
                  <option key={unidad.id} value={unidad.id}>
                    {unidad.nombre} ({unidad.abreviatura}) - Q {precioInfo?.precio?.toFixed(2)} ({precioInfo?.tipoPrecio})
                  </option>
                );
              })}
              {/* Mostrar unidades sin precio en gris */}
              {unidadesMedida
                .filter(unidad => !unidadesConPrecio.some(u => u.id === unidad.id))
                .map(unidad => (
                  <option 
                    key={unidad.id} 
                    value={unidad.id}
                    style={{ color: '#ccc' }}
                    disabled
                  >
                    {unidad.nombre} ({unidad.abreviatura}) - Sin precio configurado
                  </option>
                ))
              }
            </select>
            {errors[`detalle_${index}_unidad`] && (
              <div className="invalid-feedback">{errors[`detalle_${index}_unidad`]}</div>
            )}
          </div>

          {/* Cantidad */}
          <div className="col-md-1">
            <label className="form-label">Cantidad *</label>
            <input
              type="number"
              className={`form-control ${errors[`detalle_${index}_cantidad`] ? 'is-invalid' : ''}`}
              step="0.0001"
              min="0.0001"
              value={detalle.cantidad}
              onChange={(e) => handleFieldChange('cantidad', e.target.value)}
              required
              disabled={loading}
            />
            {errors[`detalle_${index}_cantidad`] && (
              <div className="invalid-feedback">{errors[`detalle_${index}_cantidad`]}</div>
            )}
          </div>

          {/* Precio Unitario */}
          <div className="col-md-2">
            <label className="form-label">Precio Unitario *</label>
            <input
              type="number"
              className={`form-control ${errors[`detalle_${index}_precio`] ? 'is-invalid' : ''}`}
              step="0.01"
              min="0.01"
              value={detalle.precioUnitario}
              onChange={(e) => handleFieldChange('precioUnitario', e.target.value)}
              required
              disabled={loading}
            />
            {errors[`detalle_${index}_precio`] && (
              <div className="invalid-feedback">{errors[`detalle_${index}_precio`]}</div>
            )}
            {productoSeleccionado && (
              <small className="text-muted">
                Precio {preciosDisponibles.find(p => p.unidadMedidaId === parseInt(detalle.unidadMedidaId))?.tipoPrecio || 'automático'}
              </small>
            )}
          </div>

          {/* Impuesto */}
          <div className="col-md-1">
            <label className="form-label">Impuesto</label>
            <input
              type="number"
              className="form-control"
              step="0.01"
              min="0"
              value={detalle.impuesto}
              onChange={(e) => handleFieldChange('impuesto', e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Descuento */}
          <div className="col-md-1">
            <label className="form-label">Descuento</label>
            <input
              type="number"
              className="form-control"
              step="0.01"
              min="0"
              value={detalle.descuento}
              onChange={(e) => handleFieldChange('descuento', e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Subtotal y Total */}
          <div className="col-md-2">
            <div className="bg-light p-2 rounded">
              <div className="text-center">
                <small className="text-muted">Subtotal</small>
                <div className="fw-bold">Q {(detalle.subtotal || 0).toFixed(2)}</div>
              </div>
              <div className="text-center mt-1">
                <small className="text-muted">Total</small>
                <div className="fw-bold text-primary">Q {(detalle.total || 0).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleVentaCard;