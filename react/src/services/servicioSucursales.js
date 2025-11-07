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

// Obtener sucursales activas
const obtenerSucursales = async () => {
  try {
    const respuesta = await api.get("/api/sucursales");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener todas las sucursales (incluyendo inactivas)
const obtenerTodasSucursales = async () => {
  try {
    const respuesta = await api.get("/api/sucursales/todos");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener una sucursal por ID
const obtenerSucursalPorId = async (id) => {
  try {
    const respuesta = await api.get(`/api/sucursales/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Crear nueva sucursal
const crearSucursal = async (datosSucursal) => {
  try {
    const respuesta = await api.post("/api/sucursales", datosSucursal);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar sucursal existente
const actualizarSucursal = async (id, datosSucursal) => {
  try {
    const respuesta = await api.put(`/api/sucursales/${id}`, datosSucursal);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar sucursal (eliminación lógica)
const eliminarSucursal = async (id) => {
  try {
    const respuesta = await api.delete(`/api/sucursales/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Restaurar sucursal eliminada
const restaurarSucursal = async (id) => {
  try {
    const respuesta = await api.post(`/api/sucursales/${id}/restaurar`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

export default {
  obtenerSucursales,
  obtenerTodasSucursales,
  obtenerSucursalPorId,
  crearSucursal,
  actualizarSucursal,
  eliminarSucursal,
  restaurarSucursal,
};