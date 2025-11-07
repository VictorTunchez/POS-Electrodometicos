import React, { useState, useEffect } from "react";
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
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [campoModificado, setCampoModificado] = useState({ email: false, contrasena: false });

  // Validación en tiempo real
  useEffect(() => {
    if (campoModificado.email) {
      setErrorEmail(validarEmail(email));
    }
  }, [email, campoModificado.email]);

  useEffect(() => {
    if (campoModificado.contrasena) {
      setErrorContrasena(validarContrasena(contrasena));
    }
  }, [contrasena, campoModificado.contrasena]);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);
    setCampoModificado({ email: true, contrasena: true });

    // Validaciones antes de enviar
    const emailError = validarEmail(email);
    const contrasenaError = validarContrasena(contrasena);

    setErrorEmail(emailError);
    setErrorContrasena(contrasenaError);

    if (emailError || contrasenaError) {
      setCargando(false);
      return;
    }

    try {
      await servicioAutenticacion.iniciarSesion({ email, contrasena });

      setMensaje("¡Inicio de sesión exitoso!");
      setTimeout(() => {
        navigate("/panel");
      }, 1000);
    } catch (err) {
      setError(handleApiError(err, "Error al iniciar sesión"));
    } finally {
      setCargando(false);
    }
  };

  const manejarCambioCampo = (campo) => (e) => {
    if (campo === 'email') {
      setEmail(e.target.value.replace(/\s+/g, '').toLowerCase());
    } else {
      setContrasena(e.target.value.replace(/\s+/g, ''));
    }

    if (!campoModificado[campo]) {
      setCampoModificado(prev => ({ ...prev, [campo]: true }));
    }
  };

  return (
    <div className="login-container">
      {/* Alertas flotantes SOLO para mensajes globales */}
      {mensaje && <MensajeAlerta tipo="exito" mensaje={mensaje} />}
      {error && <MensajeAlerta tipo="error" mensaje={error} />}

      <div className="login-wrapper">
        {/* Panel izquierdo ultra simple */}
        <div className="login-brand-panel">
          <div className="brand-content">
            <div className="brand-icon">
              <i className="bi bi-house-door"></i>
            </div>
            <div className="brand-text">
              <h1>El Hogar</h1>
              <p>Electrodomésticos y más</p>
            </div>
            <div className="brand-subtitle">
              <p>Sistema de punto de venta</p>
            </div>
          </div>
        </div>

        {/* Panel derecho con formulario */}
        <div className="login-form-panel">
          <div className="form-container">
            <div className="form-header">
              <h2>Bienvenido</h2>
              <p>Ingresa a tu cuenta para continuar</p>
            </div>

            <form onSubmit={manejarEnvio} className="login-form">
              <div className="form-group">
                <div className={`input-container ${errorEmail ? 'input-error' : campoModificado.email && email && !errorEmail ? 'input-success' : ''}`}>
                  <div className="input-icon-container">
                    <i className="bi bi-envelope input-icon"></i>
                  </div>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    value={email}
                    onChange={manejarCambioCampo('email')}
                    onBlur={() => setCampoModificado(prev => ({ ...prev, email: true }))}
                    placeholder="Correo electrónico"
                    disabled={cargando}
                    aria-describedby={errorEmail ? "email-error" : null}
                  />
                  {campoModificado.email && !errorEmail && email && (
                    <div className="input-status-icon">
                      <i className="bi bi-check-circle"></i>
                    </div>
                  )}
                  {errorEmail && (
                    <div className="input-status-icon">
                      <i className="bi bi-exclamation-circle"></i>
                    </div>
                  )}
                </div>
                {errorEmail && <div id="email-error" className="error-message">{errorEmail}</div>}
              </div>

              <div className="form-group">
                <div className={`input-container ${errorContrasena ? 'input-error' : campoModificado.contrasena && contrasena && !errorContrasena ? 'input-success' : ''}`}>
                  <div className="input-icon-container">
                    <i className="bi bi-lock input-icon"></i>
                  </div>
                  <input
                    type={mostrarContrasena ? "text" : "password"}
                    id="contrasena"
                    className="form-control"
                    value={contrasena}
                    onChange={manejarCambioCampo('contrasena')}
                    onBlur={() => setCampoModificado(prev => ({ ...prev, contrasena: true }))}
                    placeholder="Contraseña"
                    disabled={cargando}
                    aria-describedby={errorContrasena ? "contrasena-error" : null}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                    disabled={cargando}
                    aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <i className={`bi ${mostrarContrasena ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                  {campoModificado.contrasena && !errorContrasena && contrasena && (
                    <div className="input-status-icon">
                      <i className="bi bi-check-circle"></i>
                    </div>
                  )}
                  {errorContrasena && (
                    <div className="input-status-icon">
                      <i className="bi bi-exclamation-circle"></i>
                    </div>
                  )}
                </div>
                {errorContrasena && <div id="contrasena-error" className="error-message">{errorContrasena}</div>}
              </div>

              <button
                type="submit"
                className="btn-login"
                disabled={cargando}
                aria-busy={cargando}
              >
                {cargando ? (
                  <>
                    <span className="spinner"></span>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    Ingresar al sistema
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <span
                className="forgot-password-link"
                data-bs-toggle="modal"
                data-bs-target="#forgotPasswordModal"
                tabIndex={cargando ? -1 : 0}
              >
                ¿Olvidaste tu contraseña?
              </span>
            </div>
          </div>
        </div>
      </div>
      <ModalRecuperarContrasena />
    </div>
  );
}

export default FormularioLogin;