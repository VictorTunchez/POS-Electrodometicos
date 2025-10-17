import axios from "axios";

const URL_API = "http://localhost:8080";

const api = axios.create({
  baseURL: URL_API,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Crear nueva venta
const crearVenta = async (datosVenta) => {
  try {
    const respuesta = await api.post("/api/ventas", datosVenta);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener todas las ventas
const obtenerVentas = async () => {
  try {
    const respuesta = await api.get("/api/ventas");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener venta por ID
const obtenerVentaPorId = async (id) => {
  try {
    const respuesta = await api.get(`/api/ventas/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar venta
const actualizarVenta = async (id, datosVenta) => {
  try {
    const respuesta = await api.put(`/api/ventas/${id}`, datosVenta);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar venta
const eliminarVenta = async (id) => {
  try {
    await api.delete(`/api/ventas/${id}`);
  } catch (error) {
    throw error;
  }
};

// Cancelar venta
const cancelarVenta = async (id) => {
  try {
    const respuesta = await api.post(`/api/ventas/${id}/cancelar`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener ventas por sucursal
const obtenerVentasPorSucursal = async (sucursalId) => {
  try {
    const respuesta = await api.get(`/api/ventas/sucursal/${sucursalId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener ventas por cliente
const obtenerVentasPorCliente = async (clienteId) => {
  try {
    const respuesta = await api.get(`/api/ventas/cliente/${clienteId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener ventas por estado
const obtenerVentasPorEstado = async (estado) => {
  try {
    const respuesta = await api.get(`/api/ventas/estado/${estado}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener ventas por rango de fechas
const obtenerVentasPorRangoFechas = async (fechaInicio, fechaFin) => {
  try {
    const respuesta = await api.get(`/api/ventas/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener ventas por usuario
const obtenerVentasPorUsuario = async (usuarioId) => {
  try {
    const respuesta = await api.get(`/api/ventas/usuario/${usuarioId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener detalles de venta
const obtenerDetallesVenta = async (id) => {
  try {
    const respuesta = await api.get(`/api/ventas/${id}/detalles`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener resumen mensual
const obtenerResumenMensual = async (año, mes) => {
  try {
    const respuesta = await api.get(`/api/ventas/resumen-mensual?año=${año}&mes=${mes}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Descargar factura PDF
const descargarFacturaPdf = async (id) => {
  try {
    const respuesta = await api.get(`/api/ventas/${id}/factura-pdf`, {
      responseType: 'blob'
    });
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Descargar ticket PDF
const descargarTicketPdf = async (id) => {
  try {
    const respuesta = await api.get(`/api/ventas/${id}/ticket-pdf`, {
      responseType: 'blob'
    });
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Servicios de pago
const confirmarPagoStripe = async (sessionId) => {
  try {
    const respuesta = await api.post(`/api/pagos/confirmar-stripe?sessionId=${sessionId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

const verificarEstadoPago = async (sessionId) => {
  try {
    const respuesta = await api.get(`/api/pagos/verificar/${sessionId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

export default {
  crearVenta,
  obtenerVentas,
  obtenerVentaPorId,
  actualizarVenta,
  eliminarVenta,
  cancelarVenta,
  obtenerVentasPorSucursal,
  obtenerVentasPorCliente,
  obtenerVentasPorEstado,
  obtenerVentasPorRangoFechas,
  obtenerVentasPorUsuario,
  obtenerDetallesVenta,
  obtenerResumenMensual,
  descargarFacturaPdf,
  descargarTicketPdf,
  confirmarPagoStripe,
  verificarEstadoPago
};