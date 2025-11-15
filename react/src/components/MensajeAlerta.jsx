import React, { useEffect, useState } from "react";
import "./MensajeAlerta.css";

function MensajeAlerta({ tipo, mensaje, onClose, duracion = 4000, posicion = "top-right" }) {
  const [visible, setVisible] = useState(false);
  const [progreso, setProgreso] = useState(100);

  // Configuración para cada tipo de alerta
  const alertConfig = {
    exito: {
      iconClass: "bi bi-check-circle-fill",
      alertClass: "alerta-exito",
      ariaRole: "status"
    },
    error: {
      iconClass: "bi bi-x-circle-fill",
      alertClass: "alerta-error",
      ariaRole: "alert"
    },
    advertencia: {
      iconClass: "bi bi-exclamation-triangle-fill",
      alertClass: "alerta-advertencia",
      ariaRole: "alert"
    },
    informacion: {
      iconClass: "bi bi-info-circle-fill",
      alertClass: "alerta-info",
      ariaRole: "status"
    }
  };

  // Posicionamiento de la alerta
  const posicionClasses = {
    "top-right": "pos-top-right",
    "top-left": "pos-top-left",
    "bottom-right": "pos-bottom-right",
    "bottom-left": "pos-bottom-left",
    "top-center": "pos-top-center",
    "bottom-center": "pos-bottom-center"
  };

  const config = alertConfig[tipo] || alertConfig.informacion;

  useEffect(() => {
    // Mostrar la alerta con animación
    const showTimer = setTimeout(() => setVisible(true), 10);

    // Barra de progreso
    const intervalo = 50; // actualizar cada 50ms
    const pasos = duracion / intervalo;
    let pasoActual = 0;

    const progressInterval = setInterval(() => {
      pasoActual++;
      const nuevoProgreso = 100 - (pasoActual / pasos) * 100;
      setProgreso(nuevoProgreso);

      if (pasoActual >= pasos) {
        clearInterval(progressInterval);
      }
    }, intervalo);

    // Cerrar automáticamente
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duracion);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
      clearInterval(progressInterval);
    };
  }, [duracion]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  return (
    <div className={`alerta-container ${posicionClasses[posicion]}`}>
      <div
        className={`alerta-card ${config.alertClass} ${visible ? 'alerta-show' : 'alerta-hide'}`}
        role={config.ariaRole}
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="alerta-content">
          <div className="alerta-icon-wrapper">
            <i className={config.iconClass}></i>
          </div>
          <div className="alerta-mensaje">{mensaje}</div>
          <button
            type="button"
            className="alerta-close-btn"
            aria-label="Cerrar"
            onClick={handleClose}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
        <div className="alerta-progress-bar">
          <div
            className="alerta-progress-fill"
            style={{ width: `${progreso}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default MensajeAlerta;