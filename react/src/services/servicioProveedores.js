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

// Obtener todos los proveedores activos
const obtenerProveedores = async () => {
  try {
    const respuesta = await api.get("/api/proveedores");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener un proveedor por ID
const obtenerProveedorPorId = async (id) => {
  try {
    const respuesta = await api.get(`/api/proveedores/${id}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Crear un nuevo proveedor
const crearProveedor = async (datosProveedor) => {
  try {
    const respuesta = await api.post("/api/proveedores", datosProveedor);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar un proveedor existente
const actualizarProveedor = async (id, datosProveedor) => {
  try {
    const respuesta = await api.put(`/api/proveedores/${id}`, datosProveedor);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar un proveedor (eliminación lógica)
const eliminarProveedor = async (id) => {
  try {
    await api.delete(`/api/proveedores/${id}`);
  } catch (error) {
    throw error;
  }
};

// Buscar proveedores por razón social o RUC
const buscarProveedores = async (razonSocial, ruc) => {
  try {
    const params = new URLSearchParams();
    if (razonSocial) params.append('razonSocial', razonSocial);
    if (ruc) params.append('ruc', ruc);
    
    const respuesta = await api.get(`/api/proveedores/buscar?${params.toString()}`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Restaurar un proveedor eliminado
const restaurarProveedor = async (id) => {
  try {
    await api.post(`/api/proveedores/${id}/restaurar`);
  } catch (error) {
    throw error;
  }
};

// Obtener compras por proveedor
const obtenerComprasPorProveedor = async (proveedorId) => {
  try {
    const respuesta = await api.get(`/api/proveedores/${proveedorId}/compras`);
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

const obtenerTodosProveedores = async () => {
  try {
    const respuesta = await api.get("/api/proveedores/todos");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

// Obtener proveedores inactivos
const obtenerProveedoresInactivos = async () => {
  try {
    const respuesta = await api.get("/api/proveedores/inactivos");
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

export default {
  obtenerProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
  buscarProveedores,
  restaurarProveedor,
  obtenerComprasPorProveedor,
  obtenerTodosProveedores,
  obtenerProveedoresInactivos
};