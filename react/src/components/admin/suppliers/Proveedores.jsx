import React, { useState, useEffect } from "react";
import { useProveedores } from "./useProveedores";
import { useProveedoresFilters } from "./useProveedoresFilters";
import FiltersSection from "./FiltersSection";
import ProveedoresTable from "./ProveedoresTable";
import ProveedorForm from "./ProveedorForm";
import ProveedorDetailsModal from "./ProveedorDetail";
// import LoadingState from "../../admin/products/components/LoadingState";
import MensajeAlerta from "../../MensajeAlerta";
import "./Proveedores.css";

function Proveedores() {
  const {
    proveedores,
    loading,
    error,
    success,
    setError,
    setSuccess,
    cargarDatos,
    recargarProveedores,
    crearProveedor,
    actualizarProveedor,
    eliminarProveedor,
    restaurarProveedor,
    obtenerProveedorDetalles,
    obtenerComprasPorProveedor
  } = useProveedores();

  // Estados de UI
  const [showForm, setShowForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Estados de edición
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    searchTerm: "",
    searchType: "razonSocial",
    viewMode: "activos"
  });

  const { filteredProveedores, filtrarProveedores } = useProveedoresFilters();

  // Aplicar filtros
  const proveedoresFiltrados = filtrarProveedores(proveedores, filters);

  // Recargar datos cuando cambie el viewMode
  useEffect(() => {
    console.log("Cambió viewMode a:", filters.viewMode);
    cargarDatos(filters.viewMode);
  }, [filters.viewMode]);

  // Handlers de proveedores
  const handleCreateProveedor = async (proveedorData) => {
    const success = await crearProveedor(proveedorData);
    if (success) {
      setShowForm(false);
      setEditingProveedor(null);
    }
  };

  const handleUpdateProveedor = async (proveedorData) => {
    const success = await actualizarProveedor(editingProveedor.id, proveedorData);
    if (success) {
      setShowForm(false);
      setEditingProveedor(null);
    }
  };

  const handleEditProveedor = (proveedor) => {
    setEditingProveedor(proveedor);
    setShowForm(true);
  };

  const handleDeleteProveedor = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
      await eliminarProveedor(id, filters.viewMode);
    }
  };

  const handleRestoreProveedor = async (id) => {
    await restaurarProveedor(id, filters.viewMode);
  };

  // Handler de detalles
  const handleViewDetails = async (id) => {
    const proveedor = await obtenerProveedorDetalles(id);
    if (proveedor) {
      // Obtener compras del proveedor si es necesario
      const compras = await obtenerComprasPorProveedor(id);
      setSelectedProveedor({
        ...proveedor,
        compras: compras || []
      });
      setShowDetailsModal(true);
    }
  };

  // Handler para cambiar viewMode
  const handleViewModeChange = (nuevoModo) => {
    console.log("Cambiando a modo:", nuevoModo);
    setFilters(prev => ({ ...prev, viewMode: nuevoModo }));
  };

  // Handler para búsqueda
  const handleSearchChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Mostrar loading hasta que TODO esté cargado
  // if (loading && proveedores.length === 0) {
  //   return <LoadingState message="Cargando proveedores..." />;
  // }

  return (
    <div className="module-container">
      {error && <MensajeAlerta tipo="error" mensaje={error} onClose={() => setError("")} />}
      {success && <MensajeAlerta tipo="exito" mensaje={success} onClose={() => setSuccess("")} />}

      <div className="module-header">
        <div className="header-top">
          <h1>Gestión de Proveedores</h1>
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <i className="bi bi-plus-circle me-2"></i> Nuevo Proveedor
            </button>
          </div>
        </div>

        <FiltersSection
          filters={filters}
          onFiltersChange={handleSearchChange}
          onViewModeChange={handleViewModeChange}
        />
      </div>

      {/* Formulario de proveedor */}
      {showForm && (
        <ProveedorForm
          proveedor={editingProveedor}
          onSubmit={editingProveedor ? handleUpdateProveedor : handleCreateProveedor}
          onCancel={() => {
            setShowForm(false);
            setEditingProveedor(null);
          }}
        />
      )}

      {/* Tabla de proveedores */}
      <ProveedoresTable
        proveedores={proveedoresFiltrados}
        viewMode={filters.viewMode}
        onEditProveedor={handleEditProveedor}
        onDeleteProveedor={handleDeleteProveedor}
        onRestoreProveedor={handleRestoreProveedor}
        onViewDetails={handleViewDetails}
      />

      {/* Modal de detalles */}
      {showDetailsModal && selectedProveedor && (
        <ProveedorDetailsModal
          proveedor={selectedProveedor}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
}

export default Proveedores;