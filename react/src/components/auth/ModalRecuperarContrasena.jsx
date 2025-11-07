import React, { useState, useEffect } from "react";
import servicioAutenticacion from "../../services/servicioAutenticacion";
import { validarEmail } from "../../utils/validaciones";

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
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Recuperar Contraseña</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
              onClick={resetearFormulario}
            ></button>
          </div>
          <div className="modal-body">
            {/* Mostrar mensajes de error dentro del modal (solo para problemas técnicos) */}
            {error && (
              <div className="alerta-error mb-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            {!enviado ? (
              <>
                <p className="texto-secundario mb-4">Ingresa tu dirección de correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.</p>
                <form onSubmit={manejarEnvio}>
                  <div className="form-group">
                    <div className={`input-container ${errorEmail ? 'input-error' : campoModificado && email && !errorEmail ? 'input-success' : ''}`}>
                      <div className="input-icon-container">
                        <i className="bi bi-envelope input-icon"></i>
                      </div>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={manejarCambioEmail}
                        onBlur={() => setCampoModificado(true)}
                        disabled={cargando}
                      />
                      {campoModificado && !errorEmail && email && (
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
                    {errorEmail && <div className="error-message">{errorEmail}</div>}
                  </div>
                  <button
                    type="submit"
                    className="btn-login w-100"
                    disabled={cargando}
                  >
                    {cargando ? (
                      <>
                        <span className="spinner"></span>
                        Enviando...
                      </>
                    ) : (
                      "Enviar"
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="alerta-info">
                <div className="d-flex">
                  <i className="bi bi-info-circle-fill me-3"></i>
                  <div>
                    <h6 className="alert-heading">¡Solicitud recibida!</h6>
                    <p className="mb-2">{mensaje}</p>
                    <p className="mb-0">
                      <strong>Correo ingresado:</strong> {emailIngresado}
                    </p>
                  </div>
                </div>
                <div className="mt-3 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary flex-fill"
                    onClick={resetearFormulario}
                  >
                    Ingresar otro correo
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary flex-fill"
                    data-bs-dismiss="modal"
                    onClick={resetearFormulario}
                  >
                    Cerrar
                  </button>
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