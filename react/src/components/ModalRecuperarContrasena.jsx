import React, { useState } from "react";
import servicioAutenticacion from "../services/servicioAutenticacion";
import MensajeAlerta from "./MensajeAlerta";

function ModalRecuperarContrasena() {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      const respuesta = await servicioAutenticacion.solicitarRecuperacionContrasena(correo);
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
      {/* Alertas flotantes dentro del modal */}
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
                className="form-control mb-3"
                placeholder="Ingresa tu correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary w-100">
                Enviar enlace
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalRecuperarContrasena;

