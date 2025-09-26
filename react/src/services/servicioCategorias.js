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

// Obtener categorías activas
const obtenerCategorias = async () => {
  try {
    const respuesta = await api.get("/api/categorias");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener todas las categorías (incluyendo inactivas)
const obtenerTodasCategorias = async () => {
  try {
    const respuesta = await api.get("/api/categorias/todos");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener una categoría por ID
const obtenerCategoriaPorId = async (id) => {
  try {
    const respuesta = await api.get(`/api/categorias/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Crear nueva categoría
const crearCategoria = async (datosCategoria) => {
  try {
    const respuesta = await api.post("/api/categorias", datosCategoria);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar categoría existente
const actualizarCategoria = async (id, datosCategoria) => {
  try {
    const respuesta = await api.put(`/api/categorias/${id}`, datosCategoria);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar categoría (eliminación lógica)
const eliminarCategoria = async (id) => {
  try {
    await api.delete(`/api/categorias/${id}`);
  } catch (error) {
    throw error;
  }
};

// Restaurar categoría eliminada
const restaurarCategoria = async (id) => {
  try {
    await api.post(`/api/categorias/${id}/restaurar`);
  } catch (error) {
    throw error;
  }
};

export default {
  obtenerCategorias,
  obtenerTodasCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  restaurarCategoria,
};