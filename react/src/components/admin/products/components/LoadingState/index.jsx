import React from "react";

const LoadingState = () => {
  return (
    <div className="productos-inventario-container">
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <span className="ms-3">Cargando productos e inventario...</span>
      </div>
    </div>
  );
};

export default LoadingState;