import React, { useState, useEffect } from "react";
import servicioAutenticacion from "../../services/servicioAutenticacion";
import { validarEmail } from "../../utils/validaciones";
import "./ModalRecuperarContrasena.css";

function ModalRecuperarContrasena() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [errorEmail, setErrorEmail] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [emailIngresado, setEmailIngresado] = useState("");
  const [campoModificado, setCampoModificado] = useState(false);

  // Validación en tiempo real
  useEffect(() => {
    if (campoModificado) {
      setErrorEmail(validarEmail(email));
    }
  }, [email, campoModificado]);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setCargando(true);
    setCampoModificado(true);

    const emailError = validarEmail(email);
    setErrorEmail(emailError);
    if (emailError) {
      setCargando(false);
      return;
    }

    try {
      setEmailIngresado(email);
      await servicioAutenticacion.solicitarRecuperacionContrasena(email);
      setMensaje("Si este correo está registrado en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.");
      setEnviado(true);
    } catch (err) {
      if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network')) {
        setError("Hubo un problema de conexión. Por favor, verifica tu internet e intenta nuevamente.");
      } else {
        setMensaje("Si este correo está registrado en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.");
        setEnviado(true);
      }
    } finally {
      setCargando(false);
    }
  };

  const resetearFormulario = () => {
    setEmail("");
    setMensaje("");
    setError("");
    setErrorEmail(null);
    setEnviado(false);
    setEmailIngresado("");
    setCampoModificado(false);
  };

  const manejarCambioEmail = (e) => {
    setEmail(e.target.value.replace(/\s+/g, '').toLowerCase());
    if (!campoModificado) {
      setCampoModificado(true);
    }
  };

  return (
    <div
      className="modal fade"
      id="forgotPasswordModal"
      tabIndex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-recuperar">
          <div className="modal-header-custom">
            <div className="modal-icon">
              <i className="bi bi-shield-lock"></i>
            </div>
            <h5 className="modal-title-custom">Recuperar Contraseña</h5>
            <button
              type="button"
              className="btn-close-custom"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
              onClick={resetearFormulario}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>

          <div className="modal-body-custom">
            {error && (
              <div className="alert-custom alert-error">
                <div className="alert-icon">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div className="alert-content">
                  <p>{error}</p>
                </div>
              </div>
            )}

            {!enviado ? (
              <div className="modal-form-container">
                <p className="modal-description">
                  Ingresa tu dirección de correo electrónico y te enviaremos
                  instrucciones para restablecer tu contraseña.
                </p>

                <form onSubmit={manejarEnvio} className="recuperar-form">
                  <div className="form-group-modal">
                    <label htmlFor="email-recuperar" className="form-label-modal">
                      Correo electrónico
                    </label>
                    <div className={`input-wrapper-modal ${errorEmail ? 'has-error' : campoModificado && email && !errorEmail ? 'has-success' : ''}`}>
                      <div className="input-icon-modal">
                        <i className="bi bi-envelope"></i>
                      </div>
                      <input
                        type="email"
                        id="email-recuperar"
                        className="form-input-modal"
                        placeholder="tucorreo@gmail.com"
                        value={email}
                        onChange={manejarCambioEmail}
                        onBlur={() => setCampoModificado(true)}
                        disabled={cargando}
                      />
                      {campoModificado && !errorEmail && email && (
                        <div className="input-feedback-modal success">
                          <i className="bi bi-check-circle-fill"></i>
                        </div>
                      )}
                      {errorEmail && (
                        <div className="input-feedback-modal error">
                          <i className="bi bi-exclamation-circle-fill"></i>
                        </div>
                      )}
                    </div>
                    {errorEmail && (
                      <div className="error-text-modal">
                        <i className="bi bi-info-circle"></i>
                        {errorEmail}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn-submit-modal"
                    disabled={cargando}
                  >
                    {cargando ? (
                      <>
                        <span className="btn-spinner-modal"></span>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar</span>
                        <i className="bi bi-send"></i>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="success-container">
                <div className="success-icon-wrapper">
                  <div className="success-icon">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                </div>

                <div className="success-content">
                  <h6 className="success-title">¡Solicitud recibida!</h6>
                  <p className="success-message">{mensaje}</p>

                  <div className="email-sent-info">
                    <i className="bi bi-envelope-check"></i>
                    <div>
                      <span className="email-label">Correo ingresado:</span>
                      <span className="email-value">{emailIngresado}</span>
                    </div>
                  </div>

                  <div className="success-actions">
                    <button
                      type="button"
                      className="btn-secondary-modal"
                      onClick={resetearFormulario}
                    >
                      <i className="bi bi-arrow-counterclockwise"></i>
                      Ingresar otro correo
                    </button>
                    <button
                      type="button"
                      className="btn-primary-modal"
                      data-bs-dismiss="modal"
                      onClick={resetearFormulario}
                    >
                      Cerrar
                      <i className="bi bi-check-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalRecuperarContrasena;