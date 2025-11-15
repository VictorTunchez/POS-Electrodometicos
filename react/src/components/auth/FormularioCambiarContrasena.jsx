import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import servicioAutenticacion from "../../services/servicioAutenticacion";
import MensajeAlerta from "../MensajeAlerta";
import { validarContrasena } from "../../utils/validaciones";
import { handleApiError } from "../../utils/errorHandler";
import "./FormularioCambiarContrasena.css";

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
    <div className="cambiar-password-container">
      {mensaje && <MensajeAlerta tipo="exito" mensaje={mensaje} />}
      {error && <MensajeAlerta tipo="error" mensaje={error} />}

      <div className="cambiar-password-card">
        {/* Icono superior */}
        <div className="cambiar-icon-wrapper">
          <div className="cambiar-icon">
            <i className="bi bi-key-fill"></i>
          </div>
        </div>

        {/* Header */}
        <div className="cambiar-header">
          <h2>Cambiar Contraseña</h2>
          <p>Ingresa y confirma tu nueva contraseña</p>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarEnvio} className="cambiar-password-form">
          {/* Nueva Contraseña */}
          <div className="form-group-pass">
            <label htmlFor="nueva-contrasena" className="form-label-pass">
              Nueva contraseña
            </label>
            <div className={`input-wrapper-pass ${errorNuevaContrasena ? 'has-error' : campoModificado.nuevaContrasena && nuevaContrasena && !errorNuevaContrasena ? 'has-success' : ''}`}>
              <div className="input-icon-pass">
                <i className="bi bi-lock"></i>
              </div>
              <input
                type={mostrarNuevaContrasena ? "text" : "password"}
                id="nueva-contrasena"
                className="form-input-pass"
                placeholder="••••••••"
                value={nuevaContrasena}
                onChange={manejarCambioCampo('nuevaContrasena')}
                onBlur={() => setCampoModificado(prev => ({ ...prev, nuevaContrasena: true }))}
                disabled={cargando}
              />
              <button
                type="button"
                className="password-toggle-pass"
                onClick={() => setMostrarNuevaContrasena(!mostrarNuevaContrasena)}
                disabled={cargando}
                aria-label={mostrarNuevaContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <i className={`bi ${mostrarNuevaContrasena ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
              {campoModificado.nuevaContrasena && !errorNuevaContrasena && nuevaContrasena && (
                <div className="input-feedback-pass success">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
              )}
              {errorNuevaContrasena && (
                <div className="input-feedback-pass error">
                  <i className="bi bi-exclamation-circle-fill"></i>
                </div>
              )}
            </div>
            {errorNuevaContrasena && (
              <div className="error-text-pass">
                <i className="bi bi-info-circle"></i>
                {errorNuevaContrasena}
              </div>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div className="form-group-pass">
            <label htmlFor="confirmar-contrasena" className="form-label-pass">
              Confirmar contraseña
            </label>
            <div className={`input-wrapper-pass ${errorConfirmarContrasena ? 'has-error' : campoModificado.confirmarContrasena && confirmarContrasena && !errorConfirmarContrasena ? 'has-success' : ''}`}>
              <div className="input-icon-pass">
                <i className="bi bi-lock-fill"></i>
              </div>
              <input
                type={mostrarConfirmarContrasena ? "text" : "password"}
                id="confirmar-contrasena"
                className="form-input-pass"
                placeholder="••••••••"
                value={confirmarContrasena}
                onChange={manejarCambioCampo('confirmarContrasena')}
                onBlur={() => setCampoModificado(prev => ({ ...prev, confirmarContrasena: true }))}
                disabled={cargando}
              />
              <button
                type="button"
                className="password-toggle-pass"
                onClick={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
                disabled={cargando}
                aria-label={mostrarConfirmarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <i className={`bi ${mostrarConfirmarContrasena ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
              {campoModificado.confirmarContrasena && !errorConfirmarContrasena && confirmarContrasena && (
                <div className="input-feedback-pass success">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
              )}
              {errorConfirmarContrasena && (
                <div className="input-feedback-pass error">
                  <i className="bi bi-exclamation-circle-fill"></i>
                </div>
              )}
            </div>
            {errorConfirmarContrasena && (
              <div className="error-text-pass">
                <i className="bi bi-info-circle"></i>
                {errorConfirmarContrasena}
              </div>
            )}
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            className="btn-submit-pass"
            disabled={cargando}
            aria-busy={cargando}
          >
            {cargando ? (
              <>
                <span className="btn-spinner-pass"></span>
                <span>Cambiando contraseña...</span>
              </>
            ) : (
              <>
                <span>Cambiar contraseña</span>
                <i className="bi bi-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="cambiar-footer">
          <button
            type="button"
            className="link-back"
            onClick={() => window.location.href = "/"}
          >
            <i className="bi bi-arrow-left"></i>
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormularioCambiarContrasena;