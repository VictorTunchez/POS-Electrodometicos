import React, { useState, useEffect } from "react";
import servicioClientes from "../../../services/servicioClientes";
import servicioSucursales from "../../../services/servicioSucursales";
import servicioProductos from "../../../services/servicioProductos";
import servicioUnidadesMedida from "../../../services/servicioUnidadesMedida";
import { handleApiError } from "../../../utils/errorHandler";
import DetalleVentaCard from "./DetalleVentaCard";
import SelectConCreacionRapida from "./SelectConCreacionRapida";
import ClienteForm from "../clientes/ClienteForm";

const VentaForm = ({ venta, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    clienteId: "", // Vacío por defecto para consumidor final
    sucursalId: "",
    usuarioId: "1",
    tipoVenta: "CONTADO",
    formaPago: "EFECTIVO",
    observaciones: "",
    detalles: []
  });

  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [productos, setProductos] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Estados para creación rápida de clientes
  const [showQuickClienteModal, setShowQuickClienteModal] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [clientesData, sucursalesData, productosData, unidadesData] = await Promise.all([
          servicioClientes.obtenerClientes(),
          servicioSucursales.obtenerSucursales(),
          servicioProductos.obtenerProductos(),
          servicioUnidadesMedida.obtenerUnidadesMedidaActivas()
        ]);

        setClientes(clientesData);
        setSucursales(sucursalesData);
        setProductos(productosData);
        setUnidadesMedida(unidadesData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setErrors({ general: "Error al cargar los datos necesarios" });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Si estamos editando, cargamos los datos de la venta
  useEffect(() => {
    if (venta) {
      setFormData({
        clienteId: venta.clienteId || "",
        sucursalId: venta.sucursalId || "",
        usuarioId: venta.usuarioId || "1",
        tipoVenta: venta.tipoVenta || "CONTADO",
        formaPago: venta.formaPago || "EFECTIVO",
        observaciones: venta.observaciones || "",
        detalles: venta.detalles || []
      });
    }
  }, [venta]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  // Handler específico para selects
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

  // Función para crear cliente rápido
  const handleCreateQuickCliente = async (clienteData) => {
    try {
      const nuevoCliente = await servicioClientes.crearCliente(clienteData);
      
      // Recargar clientes inmediatamente
      const clientesActualizados = await servicioClientes.obtenerClientes();
      setClientes(clientesActualizados);
      
      // Seleccionar automáticamente el nuevo cliente
      setFormData(prev => ({
        ...prev,
        clienteId: nuevoCliente.id
      }));
      
      setShowQuickClienteModal(false);
      
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al crear el cliente");
      setErrors({ ...errors, general: errorMessage });
    }
  };

  // Funciones para detalles (manteniendo toda la lógica original)
  const safeParseBigDecimal = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const obtenerPrecioParaUnidad = (producto, unidadMedidaId) => {
    if (!producto || !producto.precios || !unidadMedidaId) return 0;

    console.log("Buscando precio para:", { 
      producto: producto.nombreProducto, 
      unidadMedidaId: unidadMedidaId,
      precios: producto.precios 
    });

    // Buscar el precio MINORISTA para la unidad de medida seleccionada
    const precioEncontrado = producto.precios.find(
      precio => precio.unidadMedidaId === parseInt(unidadMedidaId) && 
                precio.tipoPrecio === "MINORISTA"
    );

    // Si no encuentra MINORISTA, buscar cualquier precio para esa unidad
    if (!precioEncontrado) {
      const cualquierPrecio = producto.precios.find(
        precio => precio.unidadMedidaId === parseInt(unidadMedidaId)
      );
      const precioFinal = cualquierPrecio ? cualquierPrecio.precio : 0;
      console.log("Precio encontrado (cualquier tipo):", precioFinal);
      return precioFinal;
    }

    console.log("Precio MINORISTA encontrado:", precioEncontrado.precio);
    return precioEncontrado.precio;
  };

  const handleDetalleChange = (index, field, value) => {
    const nuevosDetalles = [...formData.detalles];
    
    if (field === 'productoId') {
      // MANTENER lógica original completa
      const productoSeleccionado = productos.find(p => p.id === parseInt(value));
      
      if (productoSeleccionado) {
        const unidadMedidaBase = productoSeleccionado.unidadMedidaId;
        const precioUnitario = obtenerPrecioParaUnidad(productoSeleccionado, unidadMedidaBase);

        nuevosDetalles[index] = {
          ...nuevosDetalles[index],
          productoId: value,
          unidadMedidaId: unidadMedidaBase.toString(),
          precioUnitario: precioUnitario
        };

        // Recalcular subtotal y total
        const cantidad = safeParseBigDecimal(nuevosDetalles[index].cantidad);
        const impuesto = safeParseBigDecimal(nuevosDetalles[index].impuesto);
        const descuento = safeParseBigDecimal(nuevosDetalles[index].descuento);

        const subtotal = cantidad * precioUnitario;
        const total = subtotal + impuesto - descuento;

        nuevosDetalles[index] = {
          ...nuevosDetalles[index],
          subtotal: subtotal,
          total: total
        };
      } else {
        nuevosDetalles[index] = {
          ...nuevosDetalles[index],
          productoId: value,
          unidadMedidaId: "",
          precioUnitario: 0,
          subtotal: 0,
          total: 0
        };
      }

    } else if (field === 'unidadMedidaId') {
      // MANTENER lógica original completa
      const productoId = nuevosDetalles[index].productoId;
      const productoSeleccionado = productos.find(p => p.id === parseInt(productoId));
      
      if (productoSeleccionado) {
        const precioUnitario = obtenerPrecioParaUnidad(productoSeleccionado, value);

        nuevosDetalles[index] = {
          ...nuevosDetalles[index],
          unidadMedidaId: value,
          precioUnitario: precioUnitario
        };

        // Recalcular subtotal y total
        const cantidad = safeParseBigDecimal(nuevosDetalles[index].cantidad);
        const impuesto = safeParseBigDecimal(nuevosDetalles[index].impuesto);
        const descuento = safeParseBigDecimal(nuevosDetalles[index].descuento);

        const subtotal = cantidad * precioUnitario;
        const total = subtotal + impuesto - descuento;

        nuevosDetalles[index] = {
          ...nuevosDetalles[index],
          subtotal: subtotal,
          total: total
        };
      } else {
        nuevosDetalles[index] = {
          ...nuevosDetalles[index],
          unidadMedidaId: value,
          precioUnitario: 0,
          subtotal: 0,
          total: 0
        };
      }

    } else if (field === 'cantidad') {
      // MANTENER lógica original completa
      const numericValue = safeParseBigDecimal(value);
      const precioUnitario = safeParseBigDecimal(nuevosDetalles[index].precioUnitario);
      const impuesto = safeParseBigDecimal(nuevosDetalles[index].impuesto);
      const descuento = safeParseBigDecimal(nuevosDetalles[index].descuento);

      const subtotal = numericValue * precioUnitario;
      const total = subtotal + impuesto - descuento;

      nuevosDetalles[index] = {
        ...nuevosDetalles[index],
        cantidad: numericValue,
        subtotal: subtotal,
        total: total
      };

    } else if (field === 'precioUnitario') {
      // MANTENER lógica original completa
      const numericValue = safeParseBigDecimal(value);
      const cantidad = safeParseBigDecimal(nuevosDetalles[index].cantidad);
      const impuesto = safeParseBigDecimal(nuevosDetalles[index].impuesto);
      const descuento = safeParseBigDecimal(nuevosDetalles[index].descuento);

      const subtotal = cantidad * numericValue;
      const total = subtotal + impuesto - descuento;

      nuevosDetalles[index] = {
        ...nuevosDetalles[index],
        precioUnitario: numericValue,
        subtotal: subtotal,
        total: total
      };

    } else if (field === 'impuesto' || field === 'descuento') {
      // MANTENER lógica original completa
      const numericValue = safeParseBigDecimal(value);
      const cantidad = safeParseBigDecimal(nuevosDetalles[index].cantidad);
      const precioUnitario = safeParseBigDecimal(nuevosDetalles[index].precioUnitario);
      const subtotal = cantidad * precioUnitario;

      let total;
      if (field === 'impuesto') {
        const descuento = safeParseBigDecimal(nuevosDetalles[index].descuento);
        total = subtotal + numericValue - descuento;
        nuevosDetalles[index] = {
          ...nuevosDetalles[index],
          impuesto: numericValue,
          total: total
        };
      } else {
        const impuesto = safeParseBigDecimal(nuevosDetalles[index].impuesto);
        total = subtotal + impuesto - numericValue;
        nuevosDetalles[index] = {
          ...nuevosDetalles[index],
          descuento: numericValue,
          total: total
        };
      }
    } else {
      // Para otros campos
      nuevosDetalles[index] = {
        ...nuevosDetalles[index],
        [field]: value
      };
    }

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
          productoId: "",
          unidadMedidaId: "",
          cantidad: 1,
          precioUnitario: 0,
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

    if (!formData.sucursalId) {
      newErrors.sucursalId = "La sucursal es obligatoria";
    }

    if (formData.detalles.length === 0) {
      newErrors.detalles = "Debe agregar al menos un producto";
    }

    formData.detalles.forEach((detalle, index) => {
      if (!detalle.productoId) {
        newErrors[`detalle_${index}_producto`] = "El producto es obligatorio";
      }
      if (!detalle.unidadMedidaId) {
        newErrors[`detalle_${index}_unidad`] = "La unidad de medida es obligatoria";
      }
      if (safeParseBigDecimal(detalle.cantidad) <= 0) {
        newErrors[`detalle_${index}_cantidad`] = "La cantidad debe ser mayor a 0";
      }
      if (safeParseBigDecimal(detalle.precioUnitario) <= 0) {
        newErrors[`detalle_${index}_precio`] = "El precio unitario debe ser mayor a 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calcularTotales = () => {
    const subtotal = formData.detalles.reduce((sum, detalle) => sum + (detalle.subtotal || 0), 0);
    const impuesto = formData.detalles.reduce((sum, detalle) => sum + (detalle.impuesto || 0), 0);
    const descuento = formData.detalles.reduce((sum, detalle) => sum + (detalle.descuento || 0), 0);
    const total = subtotal + impuesto - descuento;

    return { subtotal, impuesto, descuento, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      // Preparar datos - clienteId puede ser null para consumidor final
      const ventaData = {
        ...formData,
        clienteId: formData.clienteId || null, // Convertir "" a null
        detalles: formData.detalles.map(detalle => ({
          productoId: parseInt(detalle.productoId),
          unidadMedidaId: parseInt(detalle.unidadMedidaId),
          cantidad: safeParseBigDecimal(detalle.cantidad),
          precioUnitario: safeParseBigDecimal(detalle.precioUnitario),
          impuesto: safeParseBigDecimal(detalle.impuesto),
          descuento: safeParseBigDecimal(detalle.descuento)
        }))
      };

      console.log("Datos a enviar:", ventaData);
      await onSubmit(ventaData);
    } catch (error) {
      console.error("Error en el formulario:", error);
      const errorMessage = handleApiError(error, "Error al procesar la venta");
      setErrors({ general: errorMessage });
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
  const esConsumidorFinal = !formData.clienteId;

  return (
    <div className="card mb-4">
      <div className="card-header bg-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-cart-check me-2"></i>
            {venta ? "Editar Venta" : "Nueva Venta"}
          </h5>
          <button 
            className="btn-close btn-close-white" 
            onClick={onCancel}
            disabled={loading}
          ></button>
        </div>
      </div>
      <div className="card-body">
        {errors.general && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Información básica */}
          <div className="row g-3 mb-4">
            {/* Cliente con creación rápida */}
            <div className="col-md-6">
              <label className="form-label">
                Cliente 
                <span className="text-muted ms-1">(Opcional - dejar vacío para consumidor final)</span>
              </label>
              <SelectConCreacionRapida
                value={formData.clienteId}
                onChange={(value) => handleSelectChange('clienteId', value)}
                options={clientes}
                placeholder="Consumidor final"
                tipo="clientes"
                disabled={loading}
                labelCrear="Nuevo Cliente"
                onOpenQuickModal={() => setShowQuickClienteModal(true)}
                // MOSTRAR nombre y documento del cliente en el formato solicitado
                optionLabel={(cliente) => `${cliente.nombre} - ${cliente.numeroDocumento}`}
              />
              {esConsumidorFinal && (
                <small className="text-info">
                  <i className="bi bi-info-circle me-1"></i>
                  Venta a consumidor final
                </small>
              )}
            </div>

            {/* Sucursal */}
            <div className="col-md-6">
              <label className="form-label">Sucursal *</label>
              <select
                className={`form-select ${errors.sucursalId ? 'is-invalid' : ''}`}
                name="sucursalId"
                value={formData.sucursalId}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                <option value="">Seleccionar sucursal</option>
                {sucursales.map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombreSucursal}
                  </option>
                ))}
              </select>
              {errors.sucursalId && (
                <div className="invalid-feedback">{errors.sucursalId}</div>
              )}
            </div>

            {/* Tipo de Venta y Forma de Pago */}
            <div className="col-md-6">
              <label className="form-label">Tipo de Venta</label>
              <select
                className="form-select"
                name="tipoVenta"
                value={formData.tipoVenta}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="CONTADO">Contado</option>
                <option value="CREDITO" disabled>Crédito (Próximamente)</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Forma de Pago</label>
              <select
                className="form-select"
                name="formaPago"
                value={formData.formaPago}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
              </select>
            </div>

            {/* Observaciones */}
            <div className="col-12">
              <label className="form-label">Observaciones</label>
              <textarea
                className="form-control"
                name="observaciones"
                rows="3"
                value={formData.observaciones}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Observaciones adicionales sobre la venta..."
              ></textarea>
            </div>
          </div>

          {/* Detalles de la venta */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-primary">
                <i className="bi bi-list-check me-2"></i>
                Detalles de la Venta
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
                  <DetalleVentaCard
                    key={index}
                    detalle={detalle}
                    index={index}
                    onChange={handleDetalleChange}
                    onDelete={eliminarDetalle}
                    productos={productos}
                    unidadesMedida={unidadesMedida}
                    errors={errors}
                    loading={loading}
                    obtenerPrecioParaUnidad={obtenerPrecioParaUnidad}
                    safeParseBigDecimal={safeParseBigDecimal}
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
                  {venta ? "Actualizando..." : "Registrando..."}
                </>
              ) : (
                <>
                  <i className={`bi ${venta ? 'bi-check-circle' : 'bi-cart-check'} me-2`}></i>
                  {venta ? "Actualizar Venta" : "Registrar Venta"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de creación rápida de cliente */}
      {showQuickClienteModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-body p-0">
                <ClienteForm
                  cliente={null}
                  onSubmit={handleCreateQuickCliente}
                  onCancel={() => setShowQuickClienteModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentaForm;