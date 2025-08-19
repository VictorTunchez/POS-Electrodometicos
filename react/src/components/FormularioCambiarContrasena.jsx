import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import servicioAutenticacion from "../services/servicioAutenticacion";
import MensajeAlerta from "./MensajeAlerta";

function FormularioCambiarContrasena() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // obtenemos el token de la URL

  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await servicioAutenticacion.cambiarContrasena({ token, nuevaContrasena });
      setMensaje("¡Contraseña cambiada exitosamente!");
      setTimeout(() => {
        window.location.href = "/"; // redirige al login
      }, 2000);
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
      {/* Alertas independientes */}
      {mensaje && <MensajeAlerta tipo="exito" mensaje={mensaje} />}
      {error && <MensajeAlerta tipo="error" mensaje={error} />}

      <div className="login-form-container">
        <h2 className="text-center mb-4">Cambiar Contraseña</h2>
        <form onSubmit={manejarEnvio}>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Nueva contraseña"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Confirmar contraseña"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Cambiar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}

export default FormularioCambiarContrasena;
