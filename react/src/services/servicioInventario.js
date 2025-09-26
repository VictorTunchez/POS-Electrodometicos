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

// Obtener todo el inventario
const obtenerTodoInventario = async () => {
  try {
    const respuesta = await api.get("/api/inventario");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener inventario por ID
const obtenerInventarioPorId = async (id) => {
  try {
    const respuesta = await api.get(`/api/inventario/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener inventario por sucursal
const obtenerInventarioPorSucursal = async (sucursalId) => {
  try {
    const respuesta = await api.get(`/api/inventario/sucursal/${sucursalId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener inventario específico por producto y sucursal
const obtenerInventarioPorProductoSucursal = async (productoId, sucursalId) => {
  try {
    const respuesta = await api.get(`/api/inventario/producto/${productoId}/sucursal/${sucursalId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Crear nuevo registro de inventario
const crearInventario = async (datosInventario) => {
  try {
    const respuesta = await api.post("/api/inventario", datosInventario);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar registro de inventario por ID
const actualizarInventario = async (id, datosInventario) => {
  try {
    const respuesta = await api.put(`/api/inventario/${id}`, datosInventario);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar registro de inventario por ID
const eliminarInventario = async (id) => {
  try {
    await api.delete(`/api/inventario/${id}`);
  } catch (error) {
    throw error;
  }
};

// Obtener productos con stock bajo
const obtenerStockBajo = async () => {
  try {
    const respuesta = await api.get("/api/inventario/stock-bajo");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Ajustar stock por ID del registro de inventario
const ajustarStock = async (id, cantidad) => {
  try {
    const respuesta = await api.post(`/api/inventario/${id}/ajustar-stock?cantidad=${cantidad}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar stock mínimo por ID del registro de inventario
const actualizarStockMinimo = async (id, stockMinimo) => {
  try {
    const respuesta = await api.patch(`/api/inventario/${id}/stock-minimo?stockMinimo=${stockMinimo}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Ajustar stock alternativo por productoId y sucursalId
const ajustarStockPorProductoSucursal = async (productoId, sucursalId, cantidad) => {
  try {
    const respuesta = await api.post(`/api/inventario/producto/${productoId}/sucursal/${sucursalId}/ajustar-stock?cantidad=${cantidad}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

export default {
  obtenerTodoInventario,
  obtenerInventarioPorId,
  obtenerInventarioPorSucursal,
  obtenerInventarioPorProductoSucursal,
  crearInventario,
  actualizarInventario,
  eliminarInventario,
  obtenerStockBajo,
  ajustarStock,
  actualizarStockMinimo,
  ajustarStockPorProductoSucursal
};