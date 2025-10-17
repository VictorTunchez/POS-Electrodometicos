import React from "react";
import { useNavigate } from "react-router-dom";
import { useSucursales } from "./useSucursales";
import { useSucursalesFilters } from "./useSucursalesFilters";
import MensajeAlerta from "../../MensajeAlerta";
import SucursalesForm from "./SucursalesForm";
import SucursalesTable from "./SucursalesTable";
import FiltersSection from "./FilterSection";
import SucursalesDetailsModal from "./SucursalesDetailsModal";

function Sucursales() {
  const navigate = useNavigate();
  
  const {
    sucursales,
    loading,
    error,
    success,
    showForm,
    editingId,
    formData,
    viewMode,
    searchTerm,
    showDetailsModal,
    selectedSucursal,
    setError,
    setSuccess,
    setShowForm,
    setEditingId,
    setFormData,
    setViewMode,
    setSearchTerm,
    setShowDetailsModal,
    setSelectedSucursal,
    cargarSucursales,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleViewDetails,
    handleDelete,
    handleRestore,
    resetForm,
    cancelEdit
  } = useSucursales();

  const { filteredSucursales } = useSucursalesFilters(sucursales, searchTerm);

  if (loading) {
    return (
      <div className="sucursales-container">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span className="ms-3">Cargando sucursales...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      {/* Alertas flotantes */}
      {error && <MensajeAlerta tipo="error" mensaje={error} onClose={() => setError("")} />}
      {success && <MensajeAlerta tipo="exito" mensaje={success} onClose={() => setSuccess("")} />}

      <div className="module-header">
        <div className="header-top">
          <button className="btn btn-outline-secondary back-button" onClick={() => navigate('/panel')}>
            <i className="bi bi-arrow-left me-2"></i> Volver al Inicio
          </button>
          <h1>Gestión de Sucursales</h1>
          <button
            className="btn btn-primary new-button"
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-plus-circle me-2"></i> Nueva Sucursal
          </button>
        </div>

        <FiltersSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          viewMode={viewMode}
          setViewMode={setViewMode}
          placeholder="Buscar sucursal por nombre o dirección..."
        />
      </div>

      {showForm && (
        <SucursalesForm
          formData={formData}
          editingId={editingId}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          cancelEdit={cancelEdit}
        />
      )}

      <SucursalesTable
        filteredSucursales={filteredSucursales}
        viewMode={viewMode}
        handleViewDetails={handleViewDetails}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleRestore={handleRestore}
        setShowForm={setShowForm}
      />

      {showDetailsModal && selectedSucursal && (
        <SucursalesDetailsModal
          selectedSucursal={selectedSucursal}
          setShowDetailsModal={setShowDetailsModal}
          setSelectedSucursal={setSelectedSucursal}
        />
      )}
    </div>
  );
}

export default Sucursales;