import React, { useState, useEffect } from "react";
import servicioAutenticacion from "../../services/servicioAutenticacion";
import "./FormularioLogin.css";
import ModalRecuperarContrasena from "./ModalRecuperarContrasena";
import MensajeAlerta from "../MensajeAlerta";
import { validarEmail, validarContrasena } from "../../utils/validaciones";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "../../utils/errorHandler";
import logo from "../admin/icono2.png"; // ruta relativa al componente

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
  const [campoModificado, setCampoModificado] = useState({
    email: false,
    contrasena: false
  });

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
      setTimeout(() => navigate("/panel"), 1000);
    } catch (err) {
      setError(handleApiError(err, "Error al iniciar sesión"));
    } finally {
      setCargando(false);
    }
  };

  const manejarCambioCampo = (campo) => (e) => {
    const valor = e.target.value.replace(/\s+/g, '');
    if (campo === 'email') {
      setEmail(valor.toLowerCase());
    } else {
      setContrasena(valor);
    }

    if (!campoModificado[campo]) {
      setCampoModificado(prev => ({ ...prev, [campo]: true }));
    }
  };

  return (
    <div className="login-container">
      {mensaje && <MensajeAlerta tipo="exito" mensaje={mensaje} />}
      {error && <MensajeAlerta tipo="error" mensaje={error} />}

      <div className="login-wrapper">
        {/* Panel de marca mejorado */}{/*
        <div className="login-brand-panel">
          <div className="brand-content">
            <div className="brand-icon-wrapper">
              <div className="brand-icon">
                <i className="bi bi-house-door"></i>
              </div>
              <div className="icon-glow"></div>
            </div>

            <div className="brand-text" style={{ display: "block" }}>
              <h1>El Hogar</h1>
              <p className="brand-tagline">Electrodomésticos y más</p>
            </div>

            <div className="brand-divider"></div>

            <div className="brand-subtitle">
              <p>Sistema de punto de venta</p>
            </div>

            <div className="brand-features">
              <div className="feature-item">
                <i className="bi bi-shield-check"></i>
                <span>Acceso seguro</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-lightning-charge"></i>
                <span>Rápido y eficiente</span>
              </div>
            </div>
          </div>
        </div> */}
        {/* Panel de marca mejorado */}

        <div className="login-brand-panel"> {/* Para blanco puro */}
          {/* Para la versión azul suave, usa: <div className="login-brand-panel blue-variant"> */}
          <div className="brand-content">

            {/* Logo con glow sutil */}
            <div className="brand-icon-wrapper">
              <div className="brand-icon">
                <img
                  src={logo}
                  alt="El Hogar - Electrodomésticos"
                  style={{
                    width: "280px",
                    height: "auto",
                    objectFit: "contain",
                    display: "block"
                  }}
                />
              </div>
              <div className="icon-glow"></div>
            </div>

            {/* Información y características - posición mejorada */}
            <div className="brand-info">
              <div className="brand-subtitle">
                <p>Sistema de punto de venta</p>
              </div>

              <div className="brand-divider"></div>

              <div className="brand-features">
                <div className="feature-item">
                  <i className="bi bi-shield-check"></i>
                  <span>Acceso seguro</span>
                </div>
                <div className="feature-item">
                  <i className="bi bi-lightning-charge"></i>
                  <span>Rápido y eficiente</span>
                </div>
              </div>
            </div>

          </div>
        </div>


        {/* Panel de formulario mejorado */}
        <div className="login-form-panel">
          <div className="form-container">
            <div className="form-header">
              <h2>Bienvenido de nuevo</h2>
              <p>Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={manejarEnvio} className="login-form">
              {/* Campo de email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Correo electrónico
                </label>
                <div className={`input-wrapper ${errorEmail ? 'has-error' : campoModificado.email && email && !errorEmail ? 'has-success' : ''}`}>
                  <div className="input-icon">
                    <i className="bi bi-envelope"></i>
                  </div>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    value={email}
                    onChange={manejarCambioCampo('email')}
                    onBlur={() => setCampoModificado(prev => ({ ...prev, email: true }))}
                    placeholder="tu@email.com"
                    disabled={cargando}
                    aria-describedby={errorEmail ? "email-error" : null}
                  />
                  {campoModificado.email && !errorEmail && email && (
                    <div className="input-feedback success">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                  )}
                  {errorEmail && (
                    <div className="input-feedback error">
                      <i className="bi bi-exclamation-circle-fill"></i>
                    </div>
                  )}
                </div>
                {errorEmail && (
                  <div id="email-error" className="error-text">
                    <i className="bi bi-info-circle"></i>
                    {errorEmail}
                  </div>
                )}
              </div>

              {/* Campo de contraseña */}
              <div className="form-group">
                <label htmlFor="contrasena" className="form-label">
                  Contraseña
                </label>
                <div className={`input-wrapper ${errorContrasena ? 'has-error' : campoModificado.contrasena && contrasena && !errorContrasena ? 'has-success' : ''}`}>
                  <div className="input-icon">
                    <i className="bi bi-lock"></i>
                  </div>
                  <input
                    type={mostrarContrasena ? "text" : "password"}
                    id="contrasena"
                    className="form-input"
                    value={contrasena}
                    onChange={manejarCambioCampo('contrasena')}
                    onBlur={() => setCampoModificado(prev => ({ ...prev, contrasena: true }))}
                    placeholder="••••••••"
                    disabled={cargando}
                    aria-describedby={errorContrasena ? "contrasena-error" : null}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                    disabled={cargando}
                    aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <i className={`bi ${mostrarContrasena ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                  {campoModificado.contrasena && !errorContrasena && contrasena && (
                    <div className="input-feedback success">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                  )}
                  {errorContrasena && (
                    <div className="input-feedback error">
                      <i className="bi bi-exclamation-circle-fill"></i>
                    </div>
                  )}
                </div>
                {errorContrasena && (
                  <div id="contrasena-error" className="error-text">
                    <i className="bi bi-info-circle"></i>
                    {errorContrasena}
                  </div>
                )}
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                className="btn-submit"
                disabled={cargando}
                aria-busy={cargando}
              >
                {cargando ? (
                  <>
                    <span className="btn-spinner"></span>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar</span>
                    <i className="bi bi-arrow-right"></i>
                  </>
                )}
              </button>
            </form>

            {/* Footer del formulario */}
            <div className="form-footer">
              <button
                type="button"
                className="link-button"
                data-bs-toggle="modal"
                data-bs-target="#forgotPasswordModal"
                disabled={cargando}
              >
                <i className="bi bi-question-circle"></i>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModalRecuperarContrasena />
    </div>
  );
}

export default FormularioLogin;