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

// Obtener precios por producto
const obtenerPreciosPorProducto = async (productoId) => {
  try {
    const respuesta = await api.get(`/api/precios-producto/producto/${productoId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Crear nuevo precio
const crearPrecio = async (datosPrecio) => {
  try {
    const respuesta = await api.post("/api/precios-producto", datosPrecio);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar precio existente
const actualizarPrecio = async (id, datosPrecio) => {
  try {
    const respuesta = await api.put(`/api/precios-producto/${id}`, datosPrecio);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Desactivar precio
const desactivarPrecio = async (id) => {
  try {
    await api.delete(`/api/precios-producto/${id}`);
  } catch (error) {
    throw error;
  }
};

// Generar precios automáticos
const generarPreciosAutomaticos = async (productoId, porcentajeMargen) => {
  try {
    const respuesta = await api.post("/api/precios-producto/generar-automaticos", {
      productoId: productoId,
      porcentajeMargen: parseFloat(porcentajeMargen)
    });
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener información de margen del producto
const obtenerInformacionMargen = async (productoId) => {
  try {
    const respuesta = await api.get(`/api/precios-producto/producto/${productoId}/margen`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Calcular precio para una cantidad específica
const calcularPrecio = async (productoId, unidadMedidaId, cantidad, tipoPrecio = "MINORISTA") => {
  try {
    const respuesta = await api.post("/api/precios-producto/calcular", {
      productoId: productoId,
      unidadMedidaId: unidadMedidaId,
      cantidad: parseInt(cantidad),
      tipoPrecio: tipoPrecio
    });
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

export default {
  obtenerPreciosPorProducto,
  crearPrecio,
  actualizarPrecio,
  desactivarPrecio,
  generarPreciosAutomaticos,
  obtenerInformacionMargen,
  calcularPrecio
};