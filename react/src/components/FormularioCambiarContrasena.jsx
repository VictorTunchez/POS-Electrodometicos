import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import servicioAutenticacion from "../services/servicioAutenticacion";
import MensajeAlerta from "./MensajeAlerta";
import { validarContrasena } from "../utils/validaciones";

function FormularioCambiarContrasena() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // obtenemos el token de la URL

  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [errorNuevaContrasena, setErrorNuevaContrasena] = useState(null);
  const [errorConfirmarContrasena, setErrorConfirmarContrasena] = useState(null);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    const errorNueva = validarContrasena(nuevaContrasena);
    setErrorNuevaContrasena(errorNueva);
    setErrorConfirmarContrasena(null); // limpio antes de validar

    if (errorNueva) return;

    if (nuevaContrasena !== confirmarContrasena) {
      setErrorConfirmarContrasena("Las contraseñas no coinciden");
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
      {/* Alertas */}
      {mensaje && <MensajeAlerta tipo="exito" mensaje={mensaje} />}
      {error && <MensajeAlerta tipo="error" mensaje={error} />}

      <div className="login-form-container">
        <h2 className="text-center mb-4">Cambiar Contraseña</h2>
        <form onSubmit={manejarEnvio}>
          <div className="mb-3">
            <input
              type="password"
              className={`form-control ${errorNuevaContrasena ? "is-invalid" : ""}`}
              placeholder="Nueva contraseña"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value.replace(/\s+/g, ''))}
            />
            {errorNuevaContrasena && <div className="invalid-feedback">{errorNuevaContrasena}</div>}
          </div>
          <div className="mb-3">
            <input
              type="password"
              className={`form-control ${errorConfirmarContrasena ? "is-invalid" : ""}`}
              placeholder="Confirmar contraseña"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value.replace(/\s+/g, ''))}
            />
            {errorConfirmarContrasena && <div className="invalid-feedback">{errorConfirmarContrasena}</div>}
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
