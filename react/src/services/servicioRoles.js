// src/services/servicioRoles.js
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

// Obtener roles activos
const obtenerRoles = async () => {
  try {
    const respuesta = await api.get("/api/roles");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener todos los roles (incluyendo inactivos)
const obtenerTodosRoles = async () => {
  try {
    const respuesta = await api.get("/api/roles/todos");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener un rol por ID
const obtenerRolPorId = async (id) => {
  try {
    const respuesta = await api.get(`/api/roles/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener todos los permisos
const obtenerPermisos = async () => {
  try {
    const respuesta = await api.get("/api/roles/permisos");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Crear un nuevo rol
const crearRol = async (datosRol) => {
  try {
    const respuesta = await api.post("/api/roles", datosRol);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar un rol existente
const actualizarRol = async (id, datosRol) => {
  try {
    const respuesta = await api.put(`/api/roles/${id}`, datosRol);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar un rol (eliminado lógico)
const eliminarRol = async (id) => {
  try {
    const respuesta = await api.delete(`/api/roles/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Restaurar un rol eliminado
const restaurarRol = async (id) => {
  try {
    const respuesta = await api.post(`/api/roles/${id}/restaurar`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

export default {
  obtenerRoles,
  obtenerTodosRoles,
  obtenerRolPorId,
  obtenerPermisos,
  crearRol,
  actualizarRol,
  eliminarRol,
  restaurarRol,
};
