import React from "react";
import SelectConCreacionRapida from "./SelectConCreacionRapida";

const DetalleCompraCard = ({ 
  detalle, 
  index, 
  onChange, 
  onDelete, 
  productos, 
  unidadesMedida, 
  errors, 
  loading,
  onOpenQuickProductoModal
}) => {
  
  const safeToFixed = (value, decimals = 2) => {
    if (value === null || value === undefined) return "0.00";
    const number = parseFloat(value);
    return isNaN(number) ? "0.00" : number.toFixed(decimals);
  };

  
  const handleNumericInputChange = (field, e) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
    onChange(index, field, value);
  };


  const handleSelectChange = (field, e) => {
    const value = e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
    onChange(index, field, value);
  };

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
          <div className="col-md-6">
            <label className="form-label">Producto *</label>
            <SelectConCreacionRapida
              value={detalle.productoId}
              onChange={(value) => onChange(index, 'productoId', value)}
              options={productos}
              placeholder="Seleccionar producto"
              tipo="productos"
              disabled={loading}
              error={errors[`detalle_${index}_producto`]}
              labelCrear="Nuevo Producto"
              onOpenQuickModal={onOpenQuickProductoModal}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Unidad de Medida *</label>
            <select
              className={`form-select ${errors[`detalle_${index}_unidad`] ? 'is-invalid' : ''}`}
              value={detalle.unidadMedidaId}
              onChange={(e) => handleSelectChange('unidadMedidaId', e)}
              required
              disabled={loading}
            >
              <option value="0">Seleccionar unidad</option> {/* Cambiado a 0 */}
              {unidadesMedida.map(unidad => (
                <option key={unidad.id} value={unidad.id}>
                  {unidad.nombre} ({unidad.abreviatura})
                </option>
              ))}
            </select>
            {errors[`detalle_${index}_unidad`] && (
              <div className="invalid-feedback">{errors[`detalle_${index}_unidad`]}</div>
            )}
          </div>

          <div className="col-md-3">
            <label className="form-label">Cantidad *</label>
            <input
              type="number"
              className={`form-control ${errors[`detalle_${index}_cantidad`] ? 'is-invalid' : ''}`}
              step="0.0001"
              min="0.0001"
              value={detalle.cantidad}
              onChange={(e) => handleNumericInputChange('cantidad', e)}
              required
              disabled={loading}
            />
            {errors[`detalle_${index}_cantidad`] && (
              <div className="invalid-feedback">{errors[`detalle_${index}_cantidad`]}</div>
            )}
          </div>

          <div className="col-md-3">
            <label className="form-label">Costo Unitario *</label>
            <input
              type="number"
              className={`form-control ${errors[`detalle_${index}_costo`] ? 'is-invalid' : ''}`}
              step="0.01"
              min="0.01"
              value={detalle.costoUnitario}
              onChange={(e) => handleNumericInputChange('costoUnitario', e)}
              required
              disabled={loading}
            />
            {errors[`detalle_${index}_costo`] && (
              <div className="invalid-feedback">{errors[`detalle_${index}_costo`]}</div>
            )}
          </div>

          <div className="col-md-3">
            <label className="form-label">Impuesto</label>
            <input
              type="number"
              className="form-control"
              step="0.01"
              min="0"
              value={detalle.impuesto}
              onChange={(e) => handleNumericInputChange('impuesto', e)}
              disabled={loading}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Descuento</label>
            <input
              type="number"
              className="form-control"
              step="0.01"
              min="0"
              value={detalle.descuento}
              onChange={(e) => handleNumericInputChange('descuento', e)}
              disabled={loading}
            />
          </div>

          {/* Resumen del detalle */}
          <div className="col-12">
            <div className="bg-light p-3 rounded">
              <div className="row text-center">
                <div className="col-md-4">
                  <small className="text-muted">Subtotal</small>
                  <div className="fw-bold">Q {safeToFixed(detalle.subtotal)}</div>
                </div>
                <div className="col-md-4">
                  <small className="text-muted">Impuesto</small>
                  <div className="fw-bold">Q {safeToFixed(detalle.impuesto)}</div>
                </div>
                <div className="col-md-4">
                  <small className="text-muted">Total</small>
                  <div className="fw-bold text-primary">Q {safeToFixed(detalle.total)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleCompraCard;