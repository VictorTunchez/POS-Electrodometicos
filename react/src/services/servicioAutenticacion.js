// src/services/servicioAutenticacion.js
import axios from "axios";

// URL base de la API
const URL_API = "http://localhost:8080";

const iniciarSesion = async (credenciales) => {
  try {
    const respuesta = await axios.post(`${URL_API}/login`, credenciales);

    if (respuesta.data.token) {
      localStorage.setItem("token", respuesta.data.token);
    }

    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

const solicitarRecuperacionContrasena = async (usuario) => {
  try {
    const respuesta = await axios.post(`${URL_API}/auth/olvido-contrasena`, { email: usuario });
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};


const cambiarContrasena = async ({ token, nuevaContrasena }) => {
  try {
    const respuesta = await axios.post(`${URL_API}/auth/cambiar-contrasena`, { token, nuevaContrasena });
    return respuesta.data;
  } catch (error) {
    throw error;
  }
};


const obtenerSaludo = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) throw new Error("No hay token disponible");

    const respuesta = await axios.get(`${URL_API}/api/panel/bienvenida`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return respuesta.data;
  } catch (error) {
    throw error;
  }
};

//metodo paar cierre de sesion
const logout = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) throw new Error("No hay token disponible");

    const respuesta = await axios.post(`${URL_API}/auth/logout`, null,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return respuesta.data;
  } catch (error) {
    throw error;
  }
};


export default {
  iniciarSesion,
  solicitarRecuperacionContrasena,
  cambiarContrasena,
  obtenerSaludo,
  logout,
};
