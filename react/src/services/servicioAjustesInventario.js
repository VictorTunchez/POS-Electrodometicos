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

// Realizar ajuste de inventario
const realizarAjuste = async (datosAjuste) => {
  try {
    const respuesta = await api.post("/api/ajustes-inventario", datosAjuste);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener ajustes por sucursal
const obtenerAjustesPorSucursal = async (sucursalId) => {
  try {
    const respuesta = await api.get(`/api/ajustes-inventario/sucursal/${sucursalId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener ajustes por producto
const obtenerAjustesPorProducto = async (productoId) => {
  try {
    const respuesta = await api.get(`/api/ajustes-inventario/producto/${productoId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

export default {
  realizarAjuste,
  obtenerAjustesPorSucursal,
  obtenerAjustesPorProducto
};