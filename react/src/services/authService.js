// src/services/authService.js
import axios from "axios";

const API_URL = "http://localhost:8080";

// Login
const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  } catch (err) {
    throw err;
  }
};

// Forgot Password (envía el correo al backend)
const forgotPassword = async (login) => {
  try {
    const response = await axios.post(`${API_URL}/auth/olvido-contrasena`, { login });
    return response.data;
  } catch (err) {
    throw err;
  }
};

// src/services/authService.js
const changePassword = async ({ token, nuevaContrasena }) => {
  const response = await axios.post(
  `${API_URL}/auth/cambiar-contrasena`,
    { token, nuevaContrasena }
  );
  return response.data;
};

export default {
  login,
  forgotPassword,
  changePassword,
};
