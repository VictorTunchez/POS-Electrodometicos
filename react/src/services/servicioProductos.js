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

// Obtener productos activos
const obtenerProductos = async () => {
  try {
    const respuesta = await api.get("/api/productos");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener todos los productos (incluyendo inactivos)
const obtenerTodosProductos = async () => {
  try {
    const respuesta = await api.get("/api/productos/todos");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener un producto por ID
const obtenerProductoPorId = async (id) => {
  try {
    const respuesta = await api.get(`/api/productos/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener productos por categoría
const obtenerProductosPorCategoria = async (categoriaId) => {
  try {
    const respuesta = await api.get(`/api/productos/categoria/${categoriaId}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener productos destacados
const obtenerProductosDestacados = async () => {
  try {
    const respuesta = await api.get("/api/productos/destacados");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Crear nuevo producto
const crearProducto = async (datosProducto) => {
  try {
    // Preparar datos con los nuevos campos
    const datosEnviar = {
      ...datosProducto,
      // Asegurar que los números sean correctos
      //precioCompra: parseFloat(datosProducto.precioCompra) || 0,
      margenDefault: datosProducto.margenDefault ? parseFloat(datosProducto.margenDefault) : null,
      factorConversion: datosProducto.factorConversion ? parseFloat(datosProducto.factorConversion) : null,
      // Valores por defecto
      destacado: datosProducto.destacado || false,
      generarPreciosAutomaticos: datosProducto.generarPreciosAutomaticos !== false // true por defecto
    };

    const respuesta = await api.post("/api/productos", datosEnviar);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar producto existente
const actualizarProducto = async (id, datosProducto) => {
  try {
    // Preparar datos con los nuevos campos
    const datosEnviar = {
      ...datosProducto,
      //precioCompra: parseFloat(datosProducto.precioCompra) || 0,
      margenDefault: datosProducto.margenDefault ? parseFloat(datosProducto.margenDefault) : null,
      factorConversion: datosProducto.factorConversion ? parseFloat(datosProducto.factorConversion) : null,
      destacado: datosProducto.destacado || false
    };

    const respuesta = await api.put(`/api/productos/${id}`, datosEnviar);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar producto (eliminación lógica)
const eliminarProducto = async (id) => {
  try {
    await api.delete(`/api/productos/${id}`);
  } catch (error) {
    throw error;
  }
};

// Restaurar producto eliminado
const restaurarProducto = async (id) => {
  try {
    await api.post(`/api/productos/${id}/restaurar`);
  } catch (error) {
    throw error;
  }
};

export default {
  obtenerProductos,
  obtenerTodosProductos,
  obtenerProductoPorId,
  obtenerProductosPorCategoria,
  obtenerProductosDestacados,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  restaurarProducto,
};