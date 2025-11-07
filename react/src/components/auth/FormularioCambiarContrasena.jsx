import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import servicioAutenticacion from "../../services/servicioAutenticacion";
import MensajeAlerta from "../MensajeAlerta";
import { validarContrasena } from "../../utils/validaciones";
import { handleApiError } from "../../utils/errorHandler";

function FormularioCambiarContrasena() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [errorNuevaContrasena, setErrorNuevaContrasena] = useState(null);
  const [errorConfirmarContrasena, setErrorConfirmarContrasena] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mostrarNuevaContrasena, setMostrarNuevaContrasena] = useState(false);
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false);
  const [campoModificado, setCampoModificado] = useState({
    nuevaContrasena: false,
    confirmarContrasena: false
  });

  // Validación en tiempo real
  useEffect(() => {
    if (campoModificado.nuevaContrasena) {
      setErrorNuevaContrasena(validarContrasena(nuevaContrasena));
    }
  }, [nuevaContrasena, campoModificado.nuevaContrasena]);

  useEffect(() => {
    if (campoModificado.confirmarContrasena) {
      if (confirmarContrasena && nuevaContrasena !== confirmarContrasena) {
        setErrorConfirmarContrasena("Las contraseñas no coinciden");
      } else {
        setErrorConfirmarContrasena(null);
      }
    }
  }, [confirmarContrasena, nuevaContrasena, campoModificado.confirmarContrasena]);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);
    setCampoModificado({ nuevaContrasena: true, confirmarContrasena: true });

    const errorNueva = validarContrasena(nuevaContrasena);
    setErrorNuevaContrasena(errorNueva);

    let errorConfirmar = null;
    if (nuevaContrasena !== confirmarContrasena) {
      errorConfirmar = "Las contraseñas no coinciden";
    }
    setErrorConfirmarContrasena(errorConfirmar);

    if (errorNueva || errorConfirmar) {
      setCargando(false);
      return;
    }

    try {
      await servicioAutenticacion.cambiarContrasena({ token, nuevaContrasena });
      setMensaje("¡Contraseña cambiada exitosamente!");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      setError(handleApiError(err, "Error al cambiar la contraseña"));
    } finally {
      setCargando(false);
    }
  };

  const manejarCambioCampo = (campo) => (e) => {
    const value = e.target.value.replace(/\s+/g, '');
    if (campo === 'nuevaContrasena') {
      setNuevaContrasena(value);
    } else {
      setConfirmarContrasena(value);
    }

    if (!campoModificado[campo]) {
      setCampoModificado(prev => ({ ...prev, [campo]: true }));
    }
  };

  return (
    <div className="login-container">
      {/* Alertas */}
      {mensaje && <MensajeAlerta tipo="exito" mensaje={mensaje} />}
      {error && <MensajeAlerta tipo="error" mensaje={error} />}

      <div className="password-reset-wrapper">
        <div className="password-reset-card">
          <div className="form-header">
            <h2>Cambiar Contraseña</h2>
            <p>Ingresa y confirma tu nueva contraseña</p>
          </div>

          <form onSubmit={manejarEnvio} className="login-form">
            <div className="form-group">
              <div className={`input-container ${errorNuevaContrasena ? 'input-error' : campoModificado.nuevaContrasena && nuevaContrasena && !errorNuevaContrasena ? 'input-success' : ''}`}>
                <div className="input-icon-container">
                  <i className="bi bi-lock input-icon"></i>
                </div>
                <input
                  type={mostrarNuevaContrasena ? "text" : "password"}
                  className="form-control"
                  placeholder="Nueva contraseña"
                  value={nuevaContrasena}
                  onChange={manejarCambioCampo('nuevaContrasena')}
                  onBlur={() => setCampoModificado(prev => ({ ...prev, nuevaContrasena: true }))}
                  disabled={cargando}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setMostrarNuevaContrasena(!mostrarNuevaContrasena)}
                  disabled={cargando}
                  aria-label={mostrarNuevaContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <i className={`bi ${mostrarNuevaContrasena ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
                {campoModificado.nuevaContrasena && !errorNuevaContrasena && nuevaContrasena && (
                  <div className="input-status-icon">
                    <i className="bi bi-check-circle"></i>
                  </div>
                )}
                {errorNuevaContrasena && (
                  <div className="input-status-icon">
                    <i className="bi bi-exclamation-circle"></i>
                  </div>
                )}
              </div>
              {errorNuevaContrasena && <div className="error-message">{errorNuevaContrasena}</div>}
            </div>

            <div className="form-group">
              <div className={`input-container ${errorConfirmarContrasena ? 'input-error' : campoModificado.confirmarContrasena && confirmarContrasena && !errorConfirmarContrasena ? 'input-success' : ''}`}>
                <div className="input-icon-container">
                  <i className="bi bi-lock-fill input-icon"></i>
                </div>
                <input
                  type={mostrarConfirmarContrasena ? "text" : "password"}
                  className="form-control"
                  placeholder="Confirmar contraseña"
                  value={confirmarContrasena}
                  onChange={manejarCambioCampo('confirmarContrasena')}
                  onBlur={() => setCampoModificado(prev => ({ ...prev, confirmarContrasena: true }))}
                  disabled={cargando}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
                  disabled={cargando}
                  aria-label={mostrarConfirmarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <i className={`bi ${mostrarConfirmarContrasena ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
                {campoModificado.confirmarContrasena && !errorConfirmarContrasena && confirmarContrasena && (
                  <div className="input-status-icon">
                    <i className="bi bi-check-circle"></i>
                  </div>
                )}
                {errorConfirmarContrasena && (
                  <div className="input-status-icon">
                    <i className="bi bi-exclamation-circle"></i>
                  </div>
                )}
              </div>
              {errorConfirmarContrasena && <div className="error-message">{errorConfirmarContrasena}</div>}
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
                  Cambiando...
                </>
              ) : (
                <>
                  <i className="bi bi-key-fill"></i>
                  Cambiar Contraseña
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormularioCambiarContrasena;