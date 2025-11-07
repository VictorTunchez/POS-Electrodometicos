import React, { useState } from "react";
import { handleApiError } from "../../../utils/errorHandler";
import DetalleCompraCard from "./DetalleCompraCard";
import SelectConCreacionRapida from "./SelectConCreacionRapida";
import FormularioProveedor from "../suppliers/ProveedorForm";
import ProductoForm from "../products/components/ProductoForm";
import SucursalesForm from "../sucursales/SucursalesForm";


const CompraForm = ({ 
  compra, 
  onSubmit, 
  onCancel,
  // Props para creación rápida
  showQuickProveedorModal,
  showQuickProductoModal,
  showQuickSucursalModal,
  quickProveedorFormData,
  quickProductoFormData,
  quickSucursalFormData,
  onOpenQuickProveedorModal,
  onOpenQuickProductoModal,
  onOpenQuickSucursalModal,
  onCloseQuickProveedorModal,
  onCloseQuickProductoModal,
  onCloseQuickSucursalModal,
  onQuickProveedorInputChange,
  onQuickProductoInputChange,
  onQuickSucursalInputChange,
  onCreateQuickProveedor,
  onCreateQuickProducto,
  onCreateQuickSucursal,
  categorias,
  unidadesMedida,
  // Listas actualizadas desde el hook principal
  proveedores,
  sucursales,
  productos
}) => {
  const [formData, setFormData] = useState({
    numeroFactura: "",
    numeroControl: "",
    proveedorId: 0,  // Cambiado a número
    sucursalId: 0,   // Cambiado a número
    fechaCompra: new Date().toISOString().split('T')[0],
    observaciones: "",
    detalles: []
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    if (compra) {
      setFormData({
        numeroFactura: compra.numeroFactura || "",
        numeroControl: compra.numeroControl || "",
        proveedorId: compra.proveedorId || 0,  // Asegurar número
        sucursalId: compra.sucursalId || 0,    // Asegurar número
        fechaCompra: compra.fechaCompra ? new Date(compra.fechaCompra).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        observaciones: compra.observaciones || "",
        detalles: compra.detalles || []
      });
    }
  }, [compra]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    

    let finalValue = value;
    if (name === 'proveedorId' || name === 'sucursalId') {
      finalValue = value === "" ? 0 : parseInt(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };


  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };


  const safeParseBigDecimal = (value, decimals = 4) => {
    if (value === "" || value === null || value === undefined) return 0;
    const number = parseFloat(value);
    return isNaN(number) ? 0 : number;
  };


  const safeParseNumber = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleDetalleChange = (index, field, value) => {
    const nuevosDetalles = [...formData.detalles];
    

    if (field === 'cantidad' || field === 'costoUnitario' || field === 'impuesto' || field === 'descuento') {
      const numericValue = value === "" ? 0 : parseFloat(value) || 0;
      nuevosDetalles[index] = {
        ...nuevosDetalles[index],
        [field]: numericValue
      };
    } else if (field === 'productoId' || field === 'unidadMedidaId') {

      const numericValue = value === "" ? 0 : parseInt(value) || 0;
      nuevosDetalles[index] = {
        ...nuevosDetalles[index],
        [field]: numericValue
      };
    } else {
      nuevosDetalles[index] = {
        ...nuevosDetalles[index],
        [field]: value
      };
    }

    // Recalcular subtotales
    const cantidad = safeParseNumber(nuevosDetalles[index].cantidad);
    const costoUnitario = safeParseNumber(nuevosDetalles[index].costoUnitario);
    const impuesto = safeParseNumber(nuevosDetalles[index].impuesto);
    const descuento = safeParseNumber(nuevosDetalles[index].descuento);

    const subtotal = cantidad * costoUnitario;
    const total = subtotal + impuesto - descuento;

    nuevosDetalles[index] = {
      ...nuevosDetalles[index],
      subtotal: subtotal,
      total: total
    };

    setFormData(prev => ({
      ...prev,
      detalles: nuevosDetalles
    }));
  };

  const agregarDetalle = () => {
    setFormData(prev => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        {
          productoId: 0,        // Cambiado a número
          unidadMedidaId: 0,    // Cambiado a número
          cantidad: 0,
          costoUnitario: 0,
          impuesto: 0,
          descuento: 0,
          subtotal: 0,
          total: 0
        }
      ]
    }));
  };

  const eliminarDetalle = (index) => {
    const nuevosDetalles = formData.detalles.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      detalles: nuevosDetalles
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.numeroFactura || !formData.numeroFactura.trim()) {
      newErrors.numeroFactura = "El número de factura es obligatorio";
    }

    if (!formData.proveedorId || formData.proveedorId === 0) {
      newErrors.proveedorId = "El proveedor es obligatorio";
    }

    if (!formData.sucursalId || formData.sucursalId === 0) {
      newErrors.sucursalId = "La sucursal es obligatoria";
    }

    if (formData.detalles.length === 0) {
      newErrors.detalles = "Debe agregar al menos un producto";
    }

    formData.detalles.forEach((detalle, index) => {
      if (!detalle.productoId || detalle.productoId === 0) {
        newErrors[`detalle_${index}_producto`] = "El producto es obligatorio";
      }
      if (!detalle.unidadMedidaId || detalle.unidadMedidaId === 0) {
        newErrors[`detalle_${index}_unidad`] = "La unidad de medida es obligatoria";
      }
      
      const cantidad = safeParseNumber(detalle.cantidad);
      if (cantidad <= 0) {
        newErrors[`detalle_${index}_cantidad`] = "La cantidad debe ser mayor a 0";
      }
      
      const costoUnitario = safeParseNumber(detalle.costoUnitario);
      if (costoUnitario <= 0) {
        newErrors[`detalle_${index}_costo`] = "El costo unitario debe ser mayor a 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calcularTotales = () => {
    const subtotal = formData.detalles.reduce((sum, detalle) => {
      return sum + safeParseNumber(detalle.subtotal);
    }, 0);

    const impuesto = formData.detalles.reduce((sum, detalle) => {
      return sum + safeParseNumber(detalle.impuesto);
    }, 0);

    const descuento = formData.detalles.reduce((sum, detalle) => {
      return sum + safeParseNumber(detalle.descuento);
    }, 0);

    const total = subtotal + impuesto - descuento;

    return { 
      subtotal, 
      impuesto, 
      descuento, 
      total 
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setFormError('');
    
    try {
      // Preparar los datos para enviar
      const compraData = {
        numeroFactura: formData.numeroFactura.trim(),
        numeroControl: formData.numeroControl ? formData.numeroControl.trim() : null,
        proveedorId: formData.proveedorId,
        sucursalId: formData.sucursalId,
        fechaCompra: new Date(formData.fechaCompra).toISOString(),
        fechaRecepcion: null,
        observaciones: formData.observaciones ? formData.observaciones.trim() : null,
        detalles: formData.detalles.map(detalle => ({
          productoId: detalle.productoId,
          unidadMedidaId: detalle.unidadMedidaId,
          cantidad: safeParseBigDecimal(detalle.cantidad, 4),
          costoUnitario: safeParseBigDecimal(detalle.costoUnitario, 2),
          impuesto: safeParseBigDecimal(detalle.impuesto, 2),
          descuento: safeParseBigDecimal(detalle.descuento, 2)
        }))
      };

      console.log("Datos a enviar al backend:", JSON.stringify(compraData, null, 2));

      await onSubmit(compraData);
      
    } catch (error) {
      console.error("Error en el formulario:", error);
      const errorMessage = handleApiError(error, "Error al procesar la compra");
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.detalles.length) {
    return (
      <div className="card mb-4">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando datos...</p>
        </div>
      </div>
    );
  }

  const { subtotal, impuesto, descuento, total } = calcularTotales();

  return (
    <div className="card mb-4">
      <div className="card-header bg-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-cart-plus me-2"></i>
            {compra ? "Editar Compra" : "Nueva Compra"}
          </h5>
          <button 
            className="btn-close btn-close-white" 
            onClick={onCancel}
            disabled={loading}
          ></button>
        </div>
      </div>
      <div className="card-body">
        {formError && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Información básica */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="numeroFactura" className="form-label">Número de Factura *</label>
              <input
                type="text"
                className={`form-control ${errors.numeroFactura ? 'is-invalid' : ''}`}
                id="numeroFactura"
                name="numeroFactura"
                value={formData.numeroFactura}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Ingrese el número de factura"
              />
              {errors.numeroFactura && (
                <div className="invalid-feedback">{errors.numeroFactura}</div>
              )}
            </div>

            <div className="col-md-6">
              <label htmlFor="numeroControl" className="form-label">Número de Control</label>
              <input
                type="text"
                className="form-control"
                id="numeroControl"
                name="numeroControl"
                value={formData.numeroControl}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Opcional"
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="proveedorId" className="form-label">Proveedor *</label>
              <SelectConCreacionRapida
                value={formData.proveedorId}
                onChange={(value) => handleSelectChange('proveedorId', value)}
                options={proveedores}
                placeholder="Seleccionar proveedor"
                tipo="proveedores"
                disabled={loading}
                error={errors.proveedorId}
                labelCrear="Nuevo Proveedor"
                onOpenQuickModal={onOpenQuickProveedorModal}
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="sucursalId" className="form-label">Sucursal *</label>
              <SelectConCreacionRapida
                value={formData.sucursalId}
                onChange={(value) => handleSelectChange('sucursalId', value)}
                options={sucursales}
                placeholder="Seleccionar sucursal"
                tipo="sucursales"
                disabled={loading}
                error={errors.sucursalId}
                labelCrear="Nueva Sucursal"
                onOpenQuickModal={onOpenQuickSucursalModal}
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="fechaCompra" className="form-label">Fecha de Compra *</label>
              <input
                type="date"
                className="form-control"
                id="fechaCompra"
                name="fechaCompra"
                value={formData.fechaCompra}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="col-12">
              <label htmlFor="observaciones" className="form-label">Observaciones</label>
              <textarea
                className="form-control"
                id="observaciones"
                name="observaciones"
                rows="3"
                value={formData.observaciones}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Observaciones adicionales sobre la compra"
              ></textarea>
            </div>
          </div>

          {/* Detalles de la compra */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-primary">
                <i className="bi bi-list-check me-2"></i>
                Detalles de la Compra
              </h5>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={agregarDetalle}
                disabled={loading}
              >
                <i className="bi bi-plus-circle me-1"></i> Agregar Producto
              </button>
            </div>

            {errors.detalles && (
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {errors.detalles}
              </div>
            )}

            {formData.detalles.length === 0 ? (
              <div className="alert alert-info text-center py-4">
                <i className="bi bi-cart-x display-4 d-block mb-2"></i>
                <p className="mb-0">No hay productos agregados.</p>
                <small>Haz clic en "Agregar Producto" para comenzar.</small>
              </div>
            ) : (
              <div>
                {formData.detalles.map((detalle, index) => (
                  <DetalleCompraCard
                    key={index}
                    detalle={detalle}
                    index={index}
                    onChange={handleDetalleChange}
                    onDelete={eliminarDetalle}
                    productos={productos}
                    unidadesMedida={unidadesMedida}
                    errors={errors}
                    loading={loading}
                    onOpenQuickProductoModal={onOpenQuickProductoModal}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Resumen de totales */}
          <div className="row mt-4">
            <div className="col-md-6 offset-md-6">
              <div className="card border-primary">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">Resumen de Totales</h6>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>Q {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Impuesto:</span>
                    <span>Q {impuesto.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Descuento:</span>
                    <span className="text-danger">- Q {descuento.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fs-5 fw-bold">
                    <span>Total:</span>
                    <span className="text-primary">Q {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="d-flex gap-2 justify-content-end mt-4 pt-3 border-top">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  {compra ? "Actualizando..." : "Registrando..."}
                </>
              ) : (
                <>
                  <i className={`bi ${compra ? 'bi-check-circle' : 'bi-cart-check'} me-2`}></i>
                  {compra ? "Actualizar Compra" : "Registrar Compra"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modales de creación rápida */}
{showQuickProveedorModal && (
  <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}>
    <div className="modal-dialog modal-lg modal-dialog-centered">
      <div className="modal-content border-0">
        <div className="modal-body p-0">
          <FormularioProveedor
            proveedor={null}  // Añadir esta prop
            onSubmit={onCreateQuickProveedor}  // CORREGIDO: cambiar handleSubmit por onSubmit
            onCancel={onCloseQuickProveedorModal}
          />
        </div>
      </div>
    </div>
  </div>
)}

      {showQuickProductoModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-body p-0">
                <ProductoForm
                  producto={null}
                  categorias={categorias}
                  unidadesMedida={unidadesMedida}
                  onSubmit={onCreateQuickProducto}
                  onCancel={onCloseQuickProductoModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showQuickSucursalModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-body p-0">
                <SucursalesForm
                  formData={quickSucursalFormData}
                  editingId={null}
                  handleInputChange={onQuickSucursalInputChange}
                  handleSubmit={onCreateQuickSucursal}
                  cancelEdit={onCloseQuickSucursalModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompraForm;