import React, { useState, useEffect } from "react";

const ModalRecepcionParcial = ({ compra, onSubmit, onCancel }) => {
  const [detallesRecepcion, setDetallesRecepcion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Inicializar los detalles de recepción
  useEffect(() => {
    if (compra && compra.detalles) {
      console.log("DEBUG - Estructura de detalles:", compra.detalles);
      
      const iniciales = compra.detalles.map(detalle => {
        console.log("Detalle individual:", detalle);
        
        // Buscar la unidad de medida en diferentes ubicaciones posibles
        let unidadAbreviatura = "UND";
        
        if (detalle.unidadAbreviatura) {
          unidadAbreviatura = detalle.unidadAbreviatura;
        } else if (detalle.unidadMedida && detalle.unidadMedida.abreviatura) {
          unidadAbreviatura = detalle.unidadMedida.abreviatura;
        } else if (detalle.unidadMedidaNombre) {
          unidadAbreviatura = detalle.unidadMedidaNombre;
        } else if (detalle.unidadMedida && detalle.unidadMedida.nombre) {
          unidadAbreviatura = detalle.unidadMedida.nombre;
        }
        
        console.log("Unidad encontrada:", unidadAbreviatura);

        return {
          detalleCompraId: detalle.id,
          productoNombre: detalle.productoNombre,
          unidadAbreviatura: unidadAbreviatura,
          cantidadOrdenada: parseFloat(detalle.cantidad),
          cantidadRecibidaAnterior: parseFloat(detalle.cantidadRecibida || 0),
          cantidadPendiente: parseFloat(detalle.cantidad) - parseFloat(detalle.cantidadRecibida || 0),
          cantidadARecibir: 0
        };
      });
      
      setDetallesRecepcion(iniciales);
    }
  }, [compra]);

  const handleCantidadChange = (index, value) => {
    const nuevosDetalles = [...detallesRecepcion];
    const cantidad = parseFloat(value) || 0;
    
    // Validar que no exceda lo pendiente
    if (cantidad <= nuevosDetalles[index].cantidadPendiente) {
      nuevosDetalles[index].cantidadARecibir = cantidad;
      setDetallesRecepcion(nuevosDetalles);
    } else {
      // Si excede, poner el máximo permitido
      nuevosDetalles[index].cantidadARecibir = nuevosDetalles[index].cantidadPendiente;
      setDetallesRecepcion(nuevosDetalles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Preparar datos para enviar
      const datosEnviar = detallesRecepcion
        .filter(detalle => detalle.cantidadARecibir > 0)
        .map(detalle => ({
          detalleCompraId: detalle.detalleCompraId,
          cantidadRecibida: detalle.cantidadARecibir
        }));

      if (datosEnviar.length === 0) {
        setError("Debe ingresar al menos una cantidad a recibir");
        setLoading(false);
        return;
      }

      await onSubmit(datosEnviar);
    } catch (err) {
      setError(err.message || "Error al procesar la recepción parcial");
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalRecibiendo = () => {
    return detallesRecepcion.reduce((sum, detalle) => sum + detalle.cantidadARecibir, 0);
  };

  const calcularPorcentajeTotal = () => {
    const totalOrdenado = detallesRecepcion.reduce((sum, detalle) => sum + detalle.cantidadOrdenada, 0);
    const totalRecibidoAnterior = detallesRecepcion.reduce((sum, detalle) => sum + detalle.cantidadRecibidaAnterior, 0);
    const totalRecibiendo = calcularTotalRecibiendo();
    
    if (totalOrdenado === 0) return 0;
    const porcentaje = ((totalRecibidoAnterior + totalRecibiendo) / totalOrdenado) * 100;
    return Math.min(100, Math.round(porcentaje));
  };

  if (!compra) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title">
              <i className="bi bi-box-arrow-in-down me-2"></i>
              Recepción Parcial de Compra
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onCancel}></button>
          </div>
          
          <div className="modal-body">
            {/* Información de la compra */}
            <div className="row mb-4">
              <div className="col-md-6">
                <strong>Factura:</strong> {compra.numeroFactura}<br/>
                <strong>Proveedor:</strong> {compra.proveedorRazonSocial}<br/>
                <strong>Sucursal:</strong> {compra.sucursalNombre}
              </div>
              <div className="col-md-6 text-end">
                <div className="card border-info">
                  <div className="card-body py-2">
                    <small className="text-muted">Progreso total</small>
                    <div className="progress mb-1" style={{ height: '10px' }}>
                      <div 
                        className="progress-bar bg-info" 
                        style={{ width: `${calcularPorcentajeTotal()}%` }}
                      ></div>
                    </div>
                    <small>{calcularPorcentajeTotal()}% completado</small>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Producto</th>
                      <th className="text-center">Unidad</th>
                      <th className="text-center">Ordenado</th>
                      <th className="text-center">Recibido Anterior</th>
                      <th className="text-center">Pendiente</th>
                      <th className="text-center">Cantidad a Recibir</th>
                      <th className="text-center">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detallesRecepcion.map((detalle, index) => (
                      <tr key={detalle.detalleCompraId}>
                        <td>{detalle.productoNombre}</td>
                        <td className="text-center">{detalle.unidadAbreviatura}</td>
                        <td className="text-center">{detalle.cantidadOrdenada.toFixed(4)}</td>
                        <td className="text-center">{detalle.cantidadRecibidaAnterior.toFixed(4)}</td>
                        <td className="text-center">{detalle.cantidadPendiente.toFixed(4)}</td>
                        <td className="text-center">
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min="0"
                            max={detalle.cantidadPendiente}
                            step="0.0001"
                            value={detalle.cantidadARecibir}
                            onChange={(e) => handleCantidadChange(index, e.target.value)}
                            disabled={detalle.cantidadPendiente <= 0}
                          />
                        </td>
                        <td className="text-center">
                          {detalle.cantidadOrdenada > 0 ? 
                            Math.round(((detalle.cantidadRecibidaAnterior + detalle.cantidadARecibir) / detalle.cantidadOrdenada) * 100) + '%'
                            : '0%'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan="4" className="text-end"><strong>Total recibiendo:</strong></td>
                      <td className="text-center">{calcularTotalRecibiendo().toFixed(4)}</td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-info" disabled={loading || calcularTotalRecibiendo() === 0}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Recibir {calcularTotalRecibiendo().toFixed(4)} unidades
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalRecepcionParcial;