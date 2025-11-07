// components/products/Traslados.jsx
import React, { useState, useEffect } from "react";
import { useTraslados } from "./useTraslados";
import TrasladoForm from "./TrasladoForm";
import TrasladosList from "./TrasladoList";
import TrasladoDetailsModal from "./TrasladoDetailsModal";
import MensajeAlerta from "../../../MensajeAlerta";
import "./Traslados.css";

function Traslados() {
  const {
    traslados,
    productos,
    sucursales,
    unidadesMedida,
    loading,
    error,
    success,
    setError,
    setSuccess,
    cargarTraslados,
    crearTraslado,
    completarTraslado,
    cancelarTraslado,
    rechazarTraslado,
    obtenerStockProducto // Recibir la nueva función
  } = useTraslados();

  // Estados de UI
  const [showForm, setShowForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTraslado, setSelectedTraslado] = useState(null);
  const [filters, setFilters] = useState({
    estado: "TODOS",
    sucursalOrigen: "TODAS",
    sucursalDestino: "TODAS"
  });

  // Cargar traslados al montar el componente
  useEffect(() => {
    cargarTraslados();
  }, []);

  // Handlers
  const handleCreateTraslado = async (trasladoData) => {
    const success = await crearTraslado(trasladoData);
    if (success) {
      setShowForm(false);
    }
  };

  const handleCompletarTraslado = async (id) => {
    if (window.confirm("¿Estás seguro de completar este traslado? Esta acción actualizará el inventario.")) {
      await completarTraslado(id);
    }
  };

  const handleCancelarTraslado = async (id) => {
    if (window.confirm("¿Estás seguro de cancelar este traslado?")) {
      await cancelarTraslado(id);
    }
  };

  const handleRechazarTraslado = async (id, motivo) => {
    if (window.confirm("¿Estás seguro de rechazar este traslado?")) {
      await rechazarTraslado(id, motivo);
    }
  };

  const handleViewDetails = (traslado) => {
    setSelectedTraslado(traslado);
    setShowDetailsModal(true);
  };

  // Aplicar filtros
  const filteredTraslados = traslados.filter(traslado => {
    if (filters.estado !== "TODOS" && traslado.estado !== filters.estado) {
      return false;
    }
    if (filters.sucursalOrigen !== "TODAS" && traslado.sucursalOrigenId !== parseInt(filters.sucursalOrigen)) {
      return false;
    }
    if (filters.sucursalDestino !== "TODAS" && traslado.sucursalDestinoId !== parseInt(filters.sucursalDestino)) {
      return false;
    }
    return true;
  });

  return (
    <div className="module-container">
      {error && <MensajeAlerta tipo="error" mensaje={error} onClose={() => setError("")} />}
      {success && <MensajeAlerta tipo="exito" mensaje={success} onClose={() => setSuccess("")} />}

      <div className="module-header">
        <div className="header-top">
          <h1>Gestión de Traslados</h1>
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
              disabled={loading}
            >
              <i className="bi bi-arrow-left-right me-2"></i> Nuevo Traslado
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="filters-section">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Estado</label>
              <select 
                className="form-select"
                value={filters.estado}
                onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
              >
                <option value="TODOS">Todos los estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="COMPLETADO">Completados</option>
                <option value="CANCELADO">Cancelados</option>
                <option value="RECHAZADO">Rechazados</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Sucursal Origen</label>
              <select 
                className="form-select"
                value={filters.sucursalOrigen}
                onChange={(e) => setFilters(prev => ({ ...prev, sucursalOrigen: e.target.value }))}
              >
                <option value="TODAS">Todas las sucursales</option>
                {sucursales.map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombreSucursal}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Sucursal Destino</label>
              <select 
                className="form-select"
                value={filters.sucursalDestino}
                onChange={(e) => setFilters(prev => ({ ...prev, sucursalDestino: e.target.value }))}
              >
                <option value="TODAS">Todas las sucursales</option>
                {sucursales.map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombreSucursal}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de Traslado */}
      {showForm && (
        <TrasladoForm
          productos={productos}
          sucursales={sucursales}
          unidadesMedida={unidadesMedida}
          onSubmit={handleCreateTraslado}
          onCancel={() => setShowForm(false)}
          obtenerStockProducto={obtenerStockProducto} // Pasar la función
        />
      )}

      {/* Lista de Traslados */}
      <TrasladosList
        traslados={filteredTraslados}
        loading={loading}
        onCompletar={handleCompletarTraslado}
        onCancelar={handleCancelarTraslado}
        onRechazar={handleRechazarTraslado}
        onViewDetails={handleViewDetails}
      />

      {/* Modal de Detalles */}
      {showDetailsModal && selectedTraslado && (
        <TrasladoDetailsModal
          traslado={selectedTraslado}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
}

export default Traslados;