import React, { useState, useEffect } from "react";

const AjusteInventarioForm = ({ 
  inventario, 
  producto, 
  sucursal, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    tipoAjuste: "INCREMENTO",
    cantidad: "",
    motivo: "",
    observaciones: ""
  });

  const [stockActual, setStockActual] = useState(0);

  // Inicializar datos cuando cambien las props
  useEffect(() => {
    if (inventario) {
      setStockActual(parseFloat(inventario.stockActual) || 0);
    } else if (producto && producto.inventario && producto.inventario.length > 0) {
      // Si es un ajuste a nivel de producto, usar el primer inventario como referencia
      const primerInventario = producto.inventario[0];
      setStockActual(parseFloat(primerInventario.stockActual) || 0);
    }
  }, [inventario, producto]);

  const calcularNuevoStock = () => {
    const cantidad = parseFloat(formData.cantidad) || 0;
    
    switch (formData.tipoAjuste) {
      case "INCREMENTO":
        return stockActual + cantidad;
      case "DECREMENTO":
        return stockActual - cantidad;
      case "CORRECCION":
        return cantidad;
      default:
        return stockActual;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    if (!formData.motivo) {
      alert("Debe seleccionar un motivo para el ajuste");
      return;
    }

    const nuevoStock = calcularNuevoStock();
    
    // Validar que no quede stock negativo
    if (nuevoStock < 0) {
      alert("El ajuste resultaría en stock negativo. Verifique la cantidad.");
      return;
    }

    const ajusteData = {
      productoId: producto?.id || inventario?.productoId,
      sucursalId: sucursal?.id || inventario?.sucursalId,
      cantidad: parseFloat(formData.cantidad),
      tipoAjuste: formData.tipoAjuste,
      motivo: formData.motivo,
      observaciones: formData.observaciones
    };

    onSubmit(ajusteData);
  };

  const nuevoStock = calcularNuevoStock();
  const diferencia = nuevoStock - stockActual;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-sliders me-2"></i>
              Ajustar Inventario
            </h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Información del producto y sucursal */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Producto</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={producto?.nombreProducto || inventario?.nombreProducto} 
                    disabled 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Sucursal</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={sucursal?.nombreSucursal || inventario?.nombreSucursal} 
                    disabled 
                  />
                </div>
              </div>

              {/* Información de stock actual */}
              <div className="alert alert-info">
                <div className="row">
                  <div className="col-md-4">
                    <strong>Stock Actual:</strong>
                    <div className="h4 text-primary">{stockActual.toFixed(4)}</div>
                  </div>
                  <div className="col-md-4">
                    <strong>Nuevo Stock:</strong>
                    <div className={`h4 ${nuevoStock >= 0 ? 'text-success' : 'text-danger'}`}>
                      {nuevoStock.toFixed(4)}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <strong>Diferencia:</strong>
                    <div className={`h4 ${diferencia >= 0 ? 'text-success' : 'text-danger'}`}>
                      {diferencia >= 0 ? `+${diferencia.toFixed(4)}` : diferencia.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Campos del formulario */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Tipo de Ajuste *</label>
                  <select 
                    className="form-select" 
                    value={formData.tipoAjuste}
                    onChange={(e) => setFormData({...formData, tipoAjuste: e.target.value})}
                    required
                  >
                    <option value="INCREMENTO">Incremento (+)</option>
                    <option value="DECREMENTO">Decremento (-)</option>
                    <option value="CORRECCION">Corrección (Establecer valor exacto)</option>
                  </select>
                  <div className="form-text">
                    {formData.tipoAjuste === "CORRECCION" 
                      ? "Establecerá el stock al valor exacto ingresado" 
                      : formData.tipoAjuste === "INCREMENTO"
                      ? "Sumará la cantidad al stock actual"
                      : "Restará la cantidad del stock actual"
                    }
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Cantidad *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    step="0.0001"
                    min="0.0001"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
                    required
                    placeholder="0.0000"
                  />
                  <div className="form-text">Ingrese la cantidad con hasta 4 decimales</div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Motivo del Ajuste *</label>
                <select 
                  className="form-select" 
                  value={formData.motivo}
                  onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                  required
                >
                  <option value="">Seleccione un motivo</option>
                  <option value="CONTE_FISICO">Conteo físico</option>
                  <option value="DIFERENCIA_INVENTARIO">Diferencia de inventario</option>
                  <option value="DANIO_MERCADERIA">Daño de mercadería</option>
                  <option value="ROBO_PERDIDA">Robo o extravío</option>
                  <option value="CADUCIDAD">Caducidad o vencimiento</option>
                  <option value="MUESTRA_DEMOSTRACION">Muestra o demostración</option>
                  <option value="DONACION">Donación</option>
                  <option value="AJUSTE_CONTABLE">Ajuste contable</option>
                  <option value="ERROR_SISTEMA">Error del sistema</option>
                  <option value="OTRO">Otro motivo</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Observaciones</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  placeholder="Detalles adicionales del ajuste, persona que realizó el conteo físico, etc."
                  maxLength="500"
                />
                <div className="form-text">
                  {formData.observaciones.length}/500 caracteres
                </div>
              </div>

              {/* Advertencia si el stock queda negativo */}
              {nuevoStock < 0 && (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Advertencia:</strong> El ajuste resultaría en stock negativo. 
                  Esto solo se permite para corrección de errores graves.
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!formData.cantidad || !formData.motivo || nuevoStock < 0}
              >
                <i className="bi bi-check-circle me-2"></i>
                Realizar Ajuste
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AjusteInventarioForm;