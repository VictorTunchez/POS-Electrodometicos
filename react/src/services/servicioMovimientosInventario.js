import axios from "axios";

const URL_API = '';

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

// Obtener movimientos por producto y sucursal
const obtenerMovimientosPorProductoYSucursal = async (productoId, sucursalId) => {
  try {
    const respuesta = await api.get(`/api/movimientos-inventario/producto/${productoId}/sucursal/${sucursalId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener movimientos por producto (todas las sucursales)
const obtenerMovimientosPorProducto = async (productoId) => {
  try {
    // Esta endpoint lo crearíamos en el backend
    const respuesta = await api.get(`/api/movimientos-inventario/producto/${productoId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener movimientos por sucursal
const obtenerMovimientosPorSucursal = async (sucursalId, desde, hasta) => {
  try {
    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    const respuesta = await api.get(`/api/movimientos-inventario/sucursal/${sucursalId}`, { params });
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

export default {
  obtenerMovimientosPorProductoYSucursal,
  obtenerMovimientosPorProducto,
  obtenerMovimientosPorSucursal
};