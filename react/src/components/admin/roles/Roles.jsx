import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoles } from "./useRoles";
import { useRolesFilters } from "./useRolesFilters";
import MensajeAlerta from "../../MensajeAlerta";
import RolesForm from "./RolesForm";
import RolesTable from "./RolesTable";
import FiltersSection from "./FiltersSection";
import RolesDetailsModal from "./RolesDetailsModal";

function Roles() {
  const navigate = useNavigate();
  
  const {
    roles,
    permisos,
    loading,
    error,
    success,
    errorDetails,
    showForm,
    editingId,
    formData,
    selectedPermisos,
    viewMode,
    searchTerm,
    showDetailsModal,
    selectedRol,
    setError,
    setSuccess,
    setShowForm,
    setEditingId,
    setFormData,
    setSelectedPermisos,
    setViewMode,
    setSearchTerm,
    setShowDetailsModal,
    setSelectedRol,
    cargarDatos,
    handleInputChange,
    handlePermisoChange,
    handleCategoriaChange,
    handleSubmit,
    handleEdit,
    handleViewDetails,
    handleDelete,
    handleRestore,
    resetForm,
    cancelEdit,
    groupedPermisos,
    isCategoriaCompleta,
    isCategoriaParcial
  } = useRoles();

  const { filteredRoles } = useRolesFilters(roles, searchTerm);

  if (loading) {
    return (
      <div className="roles-container">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span className="ms-3">Cargando roles y permisos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      {/* Alertas flotantes */}
      {error && (
        <MensajeAlerta
          tipo="error"
          mensaje={error}
          detalles={errorDetails}
          onClose={() => {
            setError("");
            setErrorDetails([]);
          }}
        />
      )}
      {success && (
        <MensajeAlerta
          tipo="exito"
          mensaje={success}
          onClose={() => setSuccess("")}
        />
      )}

      <div className="module-header">
        <div className="header-top">
          <button className="btn btn-outline-secondary back-button" onClick={() => navigate('/panel')}>
            <i className="bi bi-arrow-left me-2"></i> Volver al Inicio
          </button>
          <h1>Gestión de Roles y Permisos</h1>
          <button
            className="btn btn-primary new-button"
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-plus-circle me-2"></i> Nuevo Rol
          </button>
        </div>

        <FiltersSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      {showForm && (
        <RolesForm
          formData={formData}
          editingId={editingId}
          selectedPermisos={selectedPermisos}
          permisos={permisos}
          groupedPermisos={groupedPermisos}
          handleInputChange={handleInputChange}
          handlePermisoChange={handlePermisoChange}
          handleCategoriaChange={handleCategoriaChange}
          handleSubmit={handleSubmit}
          cancelEdit={cancelEdit}
          isCategoriaCompleta={isCategoriaCompleta}
          isCategoriaParcial={isCategoriaParcial}
        />
      )}

      <RolesTable
        filteredRoles={filteredRoles}
        viewMode={viewMode}
        handleViewDetails={handleViewDetails}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleRestore={handleRestore}
        setShowForm={setShowForm}
      />

      {showDetailsModal && selectedRol && (
        <RolesDetailsModal
          selectedRol={selectedRol}
          setShowDetailsModal={setShowDetailsModal}
          setSelectedRol={setSelectedRol}
        />
      )}
    </div>
  );
}

export default Roles;