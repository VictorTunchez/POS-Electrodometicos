import React, { useState } from "react";
import servicioAutenticacion from "../../services/servicioAutenticacion";
import "./FormularioLogin.css";
import ModalRecuperarContrasena from "./ModalRecuperarContrasena";
import MensajeAlerta from "../MensajeAlerta";
import { validarEmail, validarContrasena } from "../../utils/validaciones";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "../../utils/errorHandler";

function FormularioLogin() {
    const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errorEmail, setErrorEmail] = useState(null);
  const [errorContrasena, setErrorContrasena] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    // Validaciones antes de enviar
    const emailError = validarEmail(email);
    const contrasenaError = validarContrasena(contrasena);

    setErrorEmail(emailError);
    setErrorContrasena(contrasenaError);

    if (emailError || contrasenaError) return; // si hay errores, no enviamos

    try {
      await servicioAutenticacion.iniciarSesion({ email, contrasena });
      setMensaje("¡Inicio de sesión exitoso!");
      setTimeout(() => {
        navigate("/panel");
      }, 1000);
    } catch (err) {
      setError(handleApiError(err, "Error al iniciar sesión"));
    }
  };

  return (
    <div className="full-page">
      {/* Alertas flotantes SOLO para mensajes globales */}
      {mensaje && <MensajeAlerta tipo="exito" mensaje={mensaje} />}
      {error && <MensajeAlerta tipo="error" mensaje={error} />}

      {/* Formulario */}
      <div className="login-form-container">
        <h2 className="text-center mb-4">Iniciar Sesión</h2>
        <form onSubmit={manejarEnvio}>
          <div className="mb-3">
            <input
              type="email"
              className={`form-control ${errorEmail ? "is-invalid" : ""}`}
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/\s+/g, '').toLowerCase())}
            />
            {errorEmail && <div className="invalid-feedback">{errorEmail}</div>}
          </div>
          <div className="mb-3">
            <input
              type="password"
              className={`form-control ${errorContrasena ? "is-invalid" : ""}`}
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value.replace(/\s+/g, ''))}
            />
            {errorContrasena && <div className="invalid-feedback">{errorContrasena}</div>}
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

