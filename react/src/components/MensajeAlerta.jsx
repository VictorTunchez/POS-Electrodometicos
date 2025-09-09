// src/components/MensajeAlerta.jsx
import React, { useEffect, useState } from "react";
import "./MensajeAlerta.css";

function MensajeAlerta({ tipo, mensaje, onClose, duracion = 3000, posicion = "top-right" }) {
  const [visible, setVisible] = useState(false);

  // Configuración para cada tipo de alerta
  const alertConfig = {
    exito: {
      iconClass: "bi bi-check-circle-fill",
      alertClass: "alert-success",
      ariaRole: "status"
    },
    error: {
      iconClass: "bi bi-exclamation-circle-fill",
      alertClass: "alert-danger",
      ariaRole: "alert"
    },
    advertencia: {
      iconClass: "bi bi-exclamation-triangle-fill",
      alertClass: "alert-warning",
      ariaRole: "alert"
    },
    informacion: {
      iconClass: "bi bi-info-circle-fill",
      alertClass: "alert-info",
      ariaRole: "status"
    }
  };

  // Posicionamiento de la alerta
  const posicionamiento = {
    "top-right": "top-0 end-0",
    "top-left": "top-0 start-0",
    "bottom-right": "bottom-0 end-0",
    "bottom-left": "bottom-0 start-0",
    "top-center": "top-0 start-50 translate-middle-x",
    "bottom-center": "bottom-0 start-50 translate-middle-x"
  };

  const config = alertConfig[tipo] || alertConfig.informacion;

  useEffect(() => {
    // Pequeño retraso para permitir la animación de entrada
    const showTimer = setTimeout(() => setVisible(true), 10);

    const closeTimer = setTimeout(() => {
      handleClose();
    }, duracion);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [duracion]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // tiempo de la animación fade-out
  };

  return (
    <div
      className={`position-fixed p-3 ${posicionamiento[posicion]}`}
      style={{ zIndex: 1055, transition: "opacity 0.3s ease" }}
    >
      <div
        className={`alert ${config.alertClass} alert-dismissible fade ${visible ? 'show' : 'hide'} d-flex align-items-center shadow`}
        role={config.ariaRole}
        aria-live="assertive"
        aria-atomic="true"
        style={{
          minWidth: "300px",
          maxWidth: "400px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-10px)",
          transition: "opacity 0.3s ease, transform 0.3s ease"
        }}
      >
        <i className={`${config.iconClass} me-2`} style={{fontSize: "1.2rem"}}></i>
        <div className="flex-grow-1">{mensaje}</div>
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={handleClose}
          style={{flexShrink: 0}}
        ></button>
      </div>
    </div>
  );
}

export default MensajeAlerta;