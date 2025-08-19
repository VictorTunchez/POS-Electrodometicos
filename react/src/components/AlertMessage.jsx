import React from "react";
import "./AlertMessage.css";

function AlertMessage({ tipo, mensaje, posicion }) {
  return (
    <div
      className={`alert alert-${tipo} d-flex align-items-center alert-fixed ${posicion}`}
      role="alert"
    >
      <div>{mensaje}</div>
    </div>
  );
}

export default AlertMessage;
