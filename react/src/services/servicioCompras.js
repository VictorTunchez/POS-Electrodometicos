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

// Registrar nueva compra
const registrarCompra = async (datosCompra) => {
  try {
    const respuesta = await api.post("/api/compras", datosCompra);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener todas las compras
const obtenerCompras = async () => {
  try {
    const respuesta = await api.get("/api/compras");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener compra por ID
const obtenerCompraPorId = async (id) => {
  try {
    const respuesta = await api.get(`/api/compras/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar compra
const actualizarCompra = async (id, datosCompra) => {
  try {
    const respuesta = await api.put(`/api/compras/${id}`, datosCompra);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar compra
const eliminarCompra = async (id) => {
  try {
    await api.delete(`/api/compras/${id}`);
  } catch (error) {
    throw error;
  }
};

// Recibir compra completa
const recibirCompra = async (id) => {
  try {
    const respuesta = await api.post(`/api/compras/${id}/recibir`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Recibir compra parcial
const recibirCompraParcial = async (id, detallesRecepcion) => {
  try {
    const respuesta = await api.post(`/api/compras/${id}/recibir-parcial`, detallesRecepcion);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Cancelar compra
const cancelarCompra = async (id) => {
  try {
    const respuesta = await api.post(`/api/compras/${id}/cancelar`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener compras por sucursal
const obtenerComprasPorSucursal = async (sucursalId) => {
  try {
    const respuesta = await api.get(`/api/compras/sucursal/${sucursalId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener compras por proveedor
const obtenerComprasPorProveedor = async (proveedorId) => {
  try {
    const respuesta = await api.get(`/api/compras/proveedor/${proveedorId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener compras por estado
const obtenerComprasPorEstado = async (estado) => {
  try {
    const respuesta = await api.get(`/api/compras/estado/${estado}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener compras por rango de fechas
const obtenerComprasPorRangoFechas = async (fechaInicio, fechaFin) => {
  try {
    const respuesta = await api.get(`/api/compras/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener resumen mensual
const obtenerResumenMensual = async (año, mes) => {
  try {
    const respuesta = await api.get(`/api/compras/resumen-mensual?año=${año}&mes=${mes}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

export default {
  registrarCompra,
  obtenerCompras,
  obtenerCompraPorId,
  actualizarCompra,
  eliminarCompra,
  recibirCompra,
  recibirCompraParcial,
  cancelarCompra,
  obtenerComprasPorSucursal,
  obtenerComprasPorProveedor,
  obtenerComprasPorEstado,
  obtenerComprasPorRangoFechas,
  obtenerResumenMensual
};