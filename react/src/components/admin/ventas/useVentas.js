import { useState, useEffect } from 'react';
import ventasService from '../../../services/servicioVentas';
import { handleApiError } from '../../../utils/errorHandler';

export const useVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingStripeVenta, setPendingStripeVenta] = useState(null);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ventasService.obtenerVentas();
      setVentas(data);
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al cargar las ventas');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const recargarVentas = async () => {
    await cargarDatos();
  };

  const crearVenta = async (ventaData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await ventasService.crearVenta(ventaData);
      
      // Si la venta es con tarjeta, guardamos la venta pendiente para mostrar Stripe
      if (ventaData.formaPago === 'TARJETA') {
        setPendingStripeVenta(response);
        setSuccess('Venta creada. Redirigiendo a Stripe...');
      } else {
        // Para EFECTIVO - NO recargamos las ventas inmediatamente
        const successMessage = 'Venta creada y completada correctamente';
        setSuccess(successMessage);
      }
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al crear la venta');
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const actualizarVenta = async (id, ventaData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await ventasService.actualizarVenta(id, ventaData);
      const successMessage = 'Venta actualizada correctamente';
      setSuccess(successMessage);
      await cargarDatos();
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al actualizar la venta');
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const eliminarVenta = async (id) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await ventasService.eliminarVenta(id);
      const successMessage = 'Venta eliminada correctamente';
      setSuccess(successMessage);
      await cargarDatos();
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al eliminar la venta');
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelarVenta = async (id) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await ventasService.cancelarVenta(id);
      const successMessage = 'Venta cancelada correctamente';
      setSuccess(successMessage);
      await cargarDatos();
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al cancelar la venta');
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const obtenerVentaDetalles = async (id) => {
    try {
      const venta = await ventasService.obtenerVentaPorId(id);
      return venta;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al cargar los detalles de la venta');
      setError(errorMessage);
      return null;
    }
  };

  const confirmarPagoStripe = async (sessionId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      console.log("Confirmando pago Stripe con sessionId:", sessionId);
      const response = await ventasService.confirmarPagoStripe(sessionId);
      console.log("Respuesta de confirmación:", response);
      
      const successMessage = 'Pago confirmado correctamente';
      setSuccess(successMessage);
      await cargarDatos();
      return response;
    } catch (error) {
      console.error("Error confirmando pago Stripe:", error);
      
      // Si el error es 500, podría ser porque el pago ya fue confirmado
      if (error.response && error.response.status === 500) {
        console.warn("El pago ya podría estar confirmado. Error 500 del servidor.");
        // No establecer error, dejar que el componente decida
        return null;
      }
      
      const errorMessage = handleApiError(error, 'Error al confirmar el pago');
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verificarEstadoPago = async (sessionId) => {
    try {
      const response = await ventasService.verificarEstadoPago(sessionId);
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al verificar el estado del pago');
      setError(errorMessage);
      return null;
    }
  };

  const descargarFacturaPdf = async (id) => {
    try {
      const pdfBlob = await ventasService.descargarFacturaPdf(id);
      
      // Crear URL para el blob y descargar
      const url = window.URL.createObjectURL(new Blob([pdfBlob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al descargar la factura');
      setError(errorMessage);
      return false;
    }
  };

  const descargarTicketPdf = async (id) => {
    try {
      const pdfBlob = await ventasService.descargarTicketPdf(id);
      
      // Crear URL para el blob y descargar
      const url = window.URL.createObjectURL(new Blob([pdfBlob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al descargar el ticket');
      setError(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return {
    ventas,
    loading,
    error,
    success,
    pendingStripeVenta,
    setError,
    setSuccess,
    setPendingStripeVenta,
    cargarDatos,
    recargarVentas,
    crearVenta,
    actualizarVenta,
    eliminarVenta,
    cancelarVenta,
    obtenerVentaDetalles,
    confirmarPagoStripe,
    verificarEstadoPago,
    descargarFacturaPdf,
    descargarTicketPdf
  };
};