// src/services/servicioUsuarios.js
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

// Obtener usuarios activos
const obtenerUsuarios = async () => {
  try {
    const respuesta = await api.get("/api/usuarios");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener todos los usuarios (incluyendo inactivos)
const obtenerTodosUsuarios = async () => {
  try {
    const respuesta = await api.get("/api/usuarios/todos");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener un usuario por ID
const obtenerUsuarioPorId = async (id) => {
  try {
    const respuesta = await api.get(`/api/usuarios/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Crear un nuevo usuario
const crearUsuario = async (datosUsuario) => {
  try {
    const respuesta = await api.post("/api/usuarios", datosUsuario);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar un usuario existente
const actualizarUsuario = async (id, datosUsuario) => {
  try {
    const respuesta = await api.put(`/api/usuarios/${id}`, datosUsuario);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar un usuario (eliminación lógica)
const eliminarUsuario = async (id) => {
  try {
    const respuesta = await api.delete(`/api/usuarios/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Restaurar un usuario eliminado
const restaurarUsuario = async (id) => {
  try {
    const respuesta = await api.post(`/api/usuarios/${id}/restaurar`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener roles para el formulario
const obtenerRoles = async () => {
  try {
    const respuesta = await api.get("/api/roles");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener sucursales para el formulario
const obtenerSucursales = async () => {
  try {
    const respuesta = await api.get("/api/sucursales");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

export default {
  obtenerUsuarios,
  obtenerTodosUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  restaurarUsuario,
  obtenerRoles,
  obtenerSucursales
};