// services/servicioTraslados.js
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

// Crear nuevo traslado
const crearTraslado = async (datosTraslado) => {
  try {
    const respuesta = await api.post("/api/traslados", datosTraslado);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Completar traslado
const completarTraslado = async (id) => {
  try {
    const respuesta = await api.post(`/api/traslados/${id}/completar`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Cancelar traslado
const cancelarTraslado = async (id) => {
  try {
    const respuesta = await api.post(`/api/traslados/${id}/cancelar`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Rechazar traslado
const rechazarTraslado = async (id, motivo) => {
  try {
    const respuesta = await api.post(`/api/traslados/${id}/rechazar`, { motivo });
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener todos los traslados
const obtenerTraslados = async () => {
  try {
    const respuesta = await api.get("/api/traslados");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener traslado por ID
const obtenerTrasladoPorId = async (id) => {
  try {
    const respuesta = await api.get(`/api/traslados/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener traslados por sucursal origen
const obtenerTrasladosPorSucursalOrigen = async (sucursalOrigenId) => {
  try {
    const respuesta = await api.get(`/api/traslados/sucursal-origen/${sucursalOrigenId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener traslados por sucursal destino
const obtenerTrasladosPorSucursalDestino = async (sucursalDestinoId) => {
  try {
    const respuesta = await api.get(`/api/traslados/sucursal-destino/${sucursalDestinoId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener traslados por estado
const obtenerTrasladosPorEstado = async (estado) => {
  try {
    const respuesta = await api.get(`/api/traslados/estado/${estado}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

export default {
  crearTraslado,
  completarTraslado,
  cancelarTraslado,
  rechazarTraslado,
  obtenerTraslados,
  obtenerTrasladoPorId,
  obtenerTrasladosPorSucursalOrigen,
  obtenerTrasladosPorSucursalDestino,
  obtenerTrasladosPorEstado,
};