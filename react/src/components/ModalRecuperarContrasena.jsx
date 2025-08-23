import React, { useState } from "react";
import servicioAutenticacion from "../services/servicioAutenticacion";
import MensajeAlerta from "./MensajeAlerta";
import { validarEmail } from "../utils/validaciones";

function ModalRecuperarContrasena() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [errorEmail, setErrorEmail] = useState(null);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    const emailError = validarEmail(email);
    setErrorEmail(emailError);
    if (emailError) return;

    try {
      const respuesta = await servicioAutenticacion.solicitarRecuperacionContrasena(email);
      setMensaje(respuesta.mensaje || "Se ha enviado un correo de recuperación.");
    } catch (err) {
      if (err.response?.data?.mensaje) {
        setError(err.response.data.mensaje);
      } else {
        setError("Error de conexión con el servidor");
      }
    }
  };

  return (
    <div
      className="modal fade"
      id="forgotPasswordModal"
      tabIndex="-1"
      aria-hidden="true"
    >
      {/* Alertas */}
        {mensaje && <MensajeAlerta tipo="exito" mensaje={mensaje} />}
        {error && <MensajeAlerta tipo="error" mensaje={error} />}

      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Recuperar Contraseña</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={manejarEnvio}>
              <input
                type="email"
                className={`form-control mb-2 ${errorEmail ? "is-invalid" : ""}`}
                placeholder="Ingresa tu correo electronico"
                value={email}
                onChange={(e) => setEmail(e.target.value.replace(/\s+/g, '').toLowerCase())}
              />
              {errorEmail && <div className="invalid-feedback">{errorEmail}</div>}
              <button type="submit" className="btn btn-primary w-100">
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalRecuperarContrasena;

