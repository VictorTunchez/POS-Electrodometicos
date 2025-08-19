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
    const respuesta = await axios.post(`${URL_API}/auth/olvido-contrasena`, { login: usuario });
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

export default {
  iniciarSesion,
  solicitarRecuperacionContrasena,
  cambiarContrasena,
};
