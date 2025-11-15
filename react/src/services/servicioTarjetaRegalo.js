import axios from "axios";

const URL_API = 'http://localhost:8080';

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

// Listar todas las tarjetas
const listar = async () => {
  try {
    const respuesta = await api.get("/api/tarjetas");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener tarjeta por ID
const obtener = async (id) => {
  try {
    const respuesta = await api.get(`/api/tarjetas/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Crear nueva tarjeta
const crear = async (tarjeta) => {
  try {
    const respuesta = await api.post("/api/tarjetas", tarjeta);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar tarjeta
const actualizar = async (id, tarjeta) => {
  try {
    const respuesta = await api.put(`/api/tarjetas/${id}`, tarjeta);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Anular tarjeta
const anular = async (id) => {
  try {
    const respuesta = await api.post(`/api/tarjetas/${id}/anular`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

export default {
  listar,
  obtener,
  crear,
  actualizar,
  anular
};