// src/components/LoginForm.jsx
import React, { useState } from "react";
import authService from "../services/authService";
import "./LoginForm.css";
import ForgotPasswordModal from "./ForgotPasswordModal";
import AlertMessage from "./AlertMessage";

function LoginForm() {
  const [login, setLogin] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    try {
      // authService ya guarda el token en localStorage
      await authService.login({ login, contrasena });
      setMensaje("Login exitoso!");
    } catch (err) {
      if (err.response?.data?.mensaje) {
        setError(err.response.data.mensaje);
      } else {
        setError("Error de conexión con el servidor");
      }
    }
  };

  return (
    <div className="full-page">
      {/* Alertas flotantes arriba a la derecha */}
      <div className="alert-container">
        {mensaje && <AlertMessage tipo="success" mensaje={mensaje} />}
        {error && <AlertMessage tipo="danger" mensaje={error} />}
      </div>

      {/* Formulario centrado */}
      <div className="login-form-container">
        <h2 className="text-center mb-4">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Correo"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Ingresar
          </button>
        </form>

        <p className="text-center mt-3">
          <span
            className="text-primary"
            style={{ cursor: "pointer" }}
            data-bs-toggle="modal"
            data-bs-target="#forgotPasswordModal"
          >
            ¿Olvidaste tu contraseña?
          </span>
        </p>

        <ForgotPasswordModal />
      </div>
    </div>
  );
}

export default LoginForm;
