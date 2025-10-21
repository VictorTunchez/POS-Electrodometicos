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

// Obtener todas las unidades de medida activas
const obtenerUnidadesMedidaActivas = async () => {
  try {
    const respuesta = await api.get("/api/unidades-medida");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener unidades de medida por tipo
const obtenerUnidadesMedidaPorTipo = async (tipo) => {
  try {
    const respuesta = await api.get(`/api/unidades-medida/tipo/${tipo}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener unidad de medida por ID
const obtenerUnidadMedidaPorId = async (id) => {
  try {
    const respuesta = await api.get(`/api/unidades-medida/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

export default {
  obtenerUnidadesMedidaActivas,
  obtenerUnidadesMedidaPorTipo,
  obtenerUnidadMedidaPorId
};