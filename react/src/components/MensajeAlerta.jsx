// src/components/MensajeAlerta.jsx
import React, { useEffect, useState } from "react";

function MensajeAlerta({ tipo, mensaje, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 3000); // se cierra en 3s
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // tiempo de la animación fade-out
  };

  if (!visible) return null;

  return (
    <div
      className="position-fixed top-0 end-0 p-3"
      style={{ zIndex: 9999 }}
    >
      <div
        className={`alert alert-${tipo === "error" ? "danger" : "success"} alert-dismissible fade show shadow`}
        role="alert"
        style={{ minWidth: "250px", maxWidth: "350px", transition: "opacity 0.3s" }}
      >
        {mensaje}
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={handleClose}
        ></button>
      </div>
    </div>
  );
}

export default MensajeAlerta;
