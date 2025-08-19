// src/components/FormularioLogin.jsx
import React, { useState } from "react";
import servicioAutenticacion from "../services/servicioAutenticacion";
import "./FormularioLogin.css";
import ModalRecuperarContrasena from "./ModalRecuperarContrasena";
import MensajeAlerta from "./MensajeAlerta";

function FormularioLogin() {
  const [login, setLogin] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    try {
      // El servicio de autenticación ya guarda el token en localStorage
      await servicioAutenticacion.iniciarSesion({ login, contrasena });
      setMensaje("¡Inicio de sesión exitoso!");
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

        {mensaje && <MensajeAlerta tipo="exito" mensaje={mensaje} />}
        {error && <MensajeAlerta tipo="error" mensaje={error} />}

      {/* Formulario centrado */}
      <div className="login-form-container">
        <h2 className="text-center mb-4">Iniciar Sesión</h2>
        <form onSubmit={manejarEnvio}>
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

        <ModalRecuperarContrasena />
      </div>
    </div>
  );
}

export default FormularioLogin;
