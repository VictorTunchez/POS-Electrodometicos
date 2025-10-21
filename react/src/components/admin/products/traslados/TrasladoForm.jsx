import React, { useState, useEffect } from "react";

const TrasladoForm = ({ 
  productos, 
  sucursales, 
  unidadesMedida, 
  onSubmit, 
  onCancel,
  obtenerStockProducto 
}) => {
  const [formData, setFormData] = useState({
    sucursalOrigenId: "",
    sucursalDestinoId: "",
    observaciones: "",
    detalles: []
  });

  const [detalleActual, setDetalleActual] = useState({
    productoId: "",
    unidadMedidaId: "",
    cantidad: ""
  });

  const [stockDisponible, setStockDisponible] = useState(0);
  const [cargandoStock, setCargandoStock] = useState(false);
  const [errores, setErrores] = useState({});

  // Efecto para cargar stock cuando cambia producto o sucursal
  useEffect(() => {
    const cargarStock = async () => {
      if (detalleActual.productoId && formData.sucursalOrigenId) {
        setCargandoStock(true);
        try {
          const stock = await obtenerStockProducto(
            parseInt(detalleActual.productoId), 
            parseInt(formData.sucursalOrigenId)
          );
          setStockDisponible(stock);
        } catch (error) {
          console.error("Error al cargar stock:", error);
          setStockDisponible(0);
        }
        setCargandoStock(false);
      } else {
        setStockDisponible(0);
      }
    };

    cargarStock();
  }, [detalleActual.productoId, formData.sucursalOrigenId, obtenerStockProducto]);

  // Efecto para establecer unidad base cuando se selecciona producto
  useEffect(() => {
    if (detalleActual.productoId) {
      const producto = productos.find(p => p.id === parseInt(detalleActual.productoId));
      if (producto) {
        setDetalleActual(prev => ({
          ...prev,
          unidadMedidaId: producto.unidadMedidaId || ""
        }));
      }
    }
  }, [detalleActual.productoId, productos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario escribe
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: "" }));
    }

    // Si cambia la sucursal origen, resetear el producto seleccionado
    if (name === "sucursalOrigenId") {
      setDetalleActual({
        productoId: "",
        unidadMedidaId: "",
        cantidad: ""
      });
      setStockDisponible(0);
    }
  };

  const handleDetalleChange = (e) => {
    const { name, value } = e.target;
    setDetalleActual(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const agregarDetalle = async () => {
    // Validaciones básicas
    if (!detalleActual.productoId || !detalleActual.cantidad || !detalleActual.unidadMedidaId) {
      setErrores({ general: "Complete todos los campos del detalle" });
      return;
    }

    if (parseFloat(detalleActual.cantidad) <= 0) {
      setErrores({ general: "La cantidad debe ser mayor a 0" });
      return;
    }

    // Validar stock disponible
    if (parseFloat(detalleActual.cantidad) > stockDisponible) {
      setErrores({ general: `Stock insuficiente. Disponible: ${stockDisponible.toFixed(2)}` });
      return;
    }

    const producto = productos.find(p => p.id === parseInt(detalleActual.productoId));
    const unidadMedida = unidadesMedida.find(u => u.id === parseInt(detalleActual.unidadMedidaId));

    const nuevoDetalle = {
      productoId: parseInt(detalleActual.productoId),
      unidadMedidaId: parseInt(detalleActual.unidadMedidaId),
      cantidad: parseFloat(detalleActual.cantidad),
      productoNombre: producto.nombreProducto,
      unidadMedidaNombre: unidadMedida.nombre,
      abreviaturaUnidadMedida: unidadMedida.abreviatura
    };

    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, nuevoDetalle]
    }));

    // Resetear detalle actual
    setDetalleActual({
      productoId: "",
      unidadMedidaId: "",
      cantidad: ""
    });
    setStockDisponible(0);
    setErrores({});
  };

  const eliminarDetalle = (index) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones
    const nuevosErrores = {};

    if (!formData.sucursalOrigenId) {
      nuevosErrores.sucursalOrigenId = "Seleccione la sucursal de origen";
    }

    if (!formData.sucursalDestinoId) {
      nuevosErrores.sucursalDestinoId = "Seleccione la sucursal de destino";
    }

    if (formData.sucursalOrigenId === formData.sucursalDestinoId) {
      nuevosErrores.sucursalDestinoId = "La sucursal destino debe ser diferente a la origen";
    }

    if (formData.detalles.length === 0) {
      nuevosErrores.detalles = "Agregue al menos un producto al traslado";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    // Enviar datos
    onSubmit(formData);
  };

  const productosFiltrados = productos.filter(p => p.activo !== false);

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Nuevo Traslado</h5>
        <button className="btn-close" onClick={onCancel}></button>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {errores.general && (
            <div className="alert alert-danger">{errores.general}</div>
          )}

          <div className="row g-3">
            {/* Sucursal Origen */}
            <div className="col-md-6">
              <label className="form-label">Sucursal Origen *</label>
              <select
                name="sucursalOrigenId"
                value={formData.sucursalOrigenId}
                onChange={handleInputChange}
                className={`form-select ${errores.sucursalOrigenId ? 'is-invalid' : ''}`}
              >
                <option value="">Seleccionar sucursal...</option>
                {sucursales.map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombreSucursal}
                  </option>
                ))}
              </select>
              {errores.sucursalOrigenId && (
                <div className="invalid-feedback">{errores.sucursalOrigenId}</div>
              )}
            </div>

            {/* Sucursal Destino */}
            <div className="col-md-6">
              <label className="form-label">Sucursal Destino *</label>
              <select
                name="sucursalDestinoId"
                value={formData.sucursalDestinoId}
                onChange={handleInputChange}
                className={`form-select ${errores.sucursalDestinoId ? 'is-invalid' : ''}`}
              >
                <option value="">Seleccionar sucursal...</option>
                {sucursales.map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombreSucursal}
                  </option>
                ))}
              </select>
              {errores.sucursalDestinoId && (
                <div className="invalid-feedback">{errores.sucursalDestinoId}</div>
              )}
            </div>

            {/* Observaciones */}
            <div className="col-12">
              <label className="form-label">Observaciones</label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="Observaciones sobre el traslado..."
              />
            </div>
          </div>

          {/* Agregar Productos */}
          <div className="detalles-section mt-4">
            <h6 className="border-bottom pb-2 mb-3">Productos a Trasladar</h6>
            
            <div className="card bg-light">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Producto</label>
                    <select
                      name="productoId"
                      value={detalleActual.productoId}
                      onChange={handleDetalleChange}
                      className="form-select"
                      disabled={!formData.sucursalOrigenId}
                    >
                      <option value="">Seleccionar producto...</option>
                      {productosFiltrados.map(producto => (
                        <option key={producto.id} value={producto.id}>
                          {producto.nombreProducto}
                        </option>
                      ))}
                    </select>
                    {!formData.sucursalOrigenId && (
                      <small className="text-muted">Seleccione primero la sucursal de origen</small>
                    )}
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Unidad</label>
                    <select
                      name="unidadMedidaId"
                      value={detalleActual.unidadMedidaId}
                      onChange={handleDetalleChange}
                      className="form-select"
                      disabled={!detalleActual.productoId}
                    >
                      <option value="">Seleccionar unidad...</option>
                      {unidadesMedida.map(unidad => (
                        <option key={unidad.id} value={unidad.id}>
                          {unidad.nombre} ({unidad.abreviatura})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">
                      Cantidad 
                      {stockDisponible > 0 && (
                        <small className="text-muted ms-1">
                          {cargandoStock ? (
                            " (Cargando...)"
                          ) : (
                            ` (Stock: ${stockDisponible.toFixed(2)})`
                          )}
                        </small>
                      )}
                    </label>
                    <input
                      type="number"
                      name="cantidad"
                      value={detalleActual.cantidad}
                      onChange={handleDetalleChange}
                      className="form-control"
                      step="0.001"
                      min="0.001"
                      disabled={!detalleActual.productoId}
                    />
                  </div>

                  <div className="col-md-2">
                    <label className="form-label">&nbsp;</label>
                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={agregarDetalle}
                      disabled={!detalleActual.productoId || !detalleActual.cantidad || cargandoStock}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de detalles agregados */}
            {formData.detalles.length > 0 ? (
              <div className="table-responsive mt-3">
                <table className="table table-sm table-striped">
                  <thead className="table-light">
                    <tr>
                      <th>Producto</th>
                      <th>Unidad</th>
                      <th>Cantidad</th>
                      <th width="80"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.detalles.map((detalle, index) => (
                      <tr key={index}>
                        <td>{detalle.productoNombre}</td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {detalle.unidadMedidaNombre} ({detalle.abreviaturaUnidadMedida})
                          </span>
                        </td>
                        <td>
                          <strong>{detalle.cantidad}</strong>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => eliminarDetalle(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert alert-info mt-3">
                <i className="bi bi-info-circle me-2"></i>
                No hay productos agregados al traslado
              </div>
            )}

            {errores.detalles && (
              <div className="alert alert-danger mt-2">{errores.detalles}</div>
            )}
          </div>

          {/* Botones */}
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={formData.detalles.length === 0}
            >
              <i className="bi bi-send me-2"></i>
              Crear Traslado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrasladoForm;