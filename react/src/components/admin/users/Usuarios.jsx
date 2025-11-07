import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsuarios } from "./useUsuarios";
import { useUsuariosFilters } from "./useUsuariosFilters";
import MensajeAlerta from "../../MensajeAlerta";
import UsuariosForm from "./UsuariosForm";
import UsuariosTable from "./UsuariosTable";
import FiltersSection from "./FiltersSection";
import UsuariosDetailsModal from "./UsuariosDetailsModal";
import RolesForm from "../roles/RolesForm.jsx";

function Usuarios() {
  const navigate = useNavigate();
  
  const {
    usuarios,
    roles,
    sucursales,
    permisos,
    loading,
    error,
    success,
    showForm,
    editingId,
    formData,
    viewMode,
    searchTerm,
    showDetailsModal,
    selectedUsuario,
    showQuickRolModal,
    quickRolFormData,
    selectedPermisos,
    setError,
    setSuccess,
    setShowForm,
    setEditingId,
    setFormData,
    setViewMode,
    setSearchTerm,
    setShowDetailsModal,
    setSelectedUsuario,
    setShowQuickRolModal,
    setQuickRolFormData,
    setSelectedPermisos,
    cargarDatos,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleViewDetails,
    handleDelete,
    handleRestore,
    resetForm,
    cancelEdit,
    handleCreateQuickRol,
    handleQuickRolInputChange,
    handlePermisoChange,
    handleCategoriaChange,
    groupedPermisos,
    isCategoriaCompleta,
    isCategoriaParcial
  } = useUsuarios();

  const { filteredUsuarios } = useUsuariosFilters(usuarios, searchTerm);

  if (loading) {
    return (
      <div className="usuarios-container">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span className="ms-3">Cargando usuarios...</span>
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
          <h1>Gestión de Usuarios</h1>
          <button
            className="btn btn-primary new-button"
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-plus-circle me-2"></i> Nuevo Usuario
          </button>
        </div>

        <FiltersSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          viewMode={viewMode}
          setViewMode={setViewMode}
          placeholder="Buscar usuario por email, nombre o apellido..."
        />
      </div>

      {showForm && (
        <UsuariosForm
          formData={formData}
          editingId={editingId}
          roles={roles}
          sucursales={sucursales}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          cancelEdit={cancelEdit}
          onOpenQuickRolModal={() => setShowQuickRolModal(true)}
        />
      )}

      <UsuariosTable
        filteredUsuarios={filteredUsuarios}
        viewMode={viewMode}
        handleViewDetails={handleViewDetails}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleRestore={handleRestore}
        setShowForm={setShowForm}
      />

      {showDetailsModal && selectedUsuario && (
        <UsuariosDetailsModal
          selectedUsuario={selectedUsuario}
          setShowDetailsModal={setShowDetailsModal}
          setSelectedUsuario={setSelectedUsuario}
        />
      )}

      {/* Modal para creación rápida de Rol - Simplificado */}
      {showQuickRolModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-body p-0">
                <RolesForm
                  formData={quickRolFormData}
                  editingId={null}
                  selectedPermisos={selectedPermisos}
                  permisos={permisos}
                  groupedPermisos={groupedPermisos}
                  handleInputChange={handleQuickRolInputChange}
                  handlePermisoChange={handlePermisoChange}
                  handleCategoriaChange={handleCategoriaChange}
                  handleSubmit={handleCreateQuickRol}
                  cancelEdit={() => setShowQuickRolModal(false)}
                  isCategoriaCompleta={isCategoriaCompleta}
                  isCategoriaParcial={isCategoriaParcial}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;