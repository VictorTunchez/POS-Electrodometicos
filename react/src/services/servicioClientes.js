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

// Crear nuevo cliente
const crearCliente = async (datosCliente) => {
  try {
    const respuesta = await api.post("/api/clientes", datosCliente);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener todos los clientes
const obtenerClientes = async () => {
  try {
    const respuesta = await api.get("/api/clientes");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener cliente por ID
const obtenerClientePorId = async (id) => {
  try {
    const respuesta = await api.get(`/api/clientes/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar cliente
const actualizarCliente = async (id, datosCliente) => {
  try {
    const respuesta = await api.put(`/api/clientes/${id}`, datosCliente);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar cliente
const eliminarCliente = async (id) => {
  try {
    await api.delete(`/api/clientes/${id}`);
  } catch (error) {
    throw error;
  }
};

// Buscar cliente por documento
const buscarClientePorDocumento = async (numeroDocumento) => {
  try {
    const respuesta = await api.get(`/api/clientes/buscar?numeroDocumento=${numeroDocumento}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

export default {
  crearCliente,
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente,
  buscarClientePorDocumento
};