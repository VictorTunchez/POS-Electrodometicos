import React, { useState, useEffect } from "react";
import { useCompras } from "./useCompras";
import { useComprasFilters } from "./useComprasFilters";
import FiltersSection from "./FiltersSection";
import ComprasTable from "./ComprasTable";
import CompraForm from "./CompraForm";
import CompraDetailsModal from "./CompraDetailsModal";
import MensajeAlerta from "../../MensajeAlerta";
import "./Compras.css";

function Compras() {
  const {
    compras,
    loading,
    error,
    success,
    showForm,
    editingId,
    formData,
    proveedores,
    sucursales,
    productos,
    unidadesMedida,
    categorias,
    showQuickProveedorModal,
    showQuickProductoModal,
    showQuickSucursalModal,
    quickProveedorFormData,
    quickProductoFormData,
    quickSucursalFormData,
    setError,
    setSuccess,
    setShowForm,
    setEditingId,
    setFormData,
    setShowQuickProveedorModal,
    setShowQuickProductoModal,
    setShowQuickSucursalModal,
    setQuickProveedorFormData,
    setQuickProductoFormData,
    setQuickSucursalFormData,
    cargarDatos,
    handleInputChange,
    handleDetalleChange,
    agregarDetalle,
    eliminarDetalle,
    handleSubmit,
    handleEdit,
    resetForm,
    cancelEdit,
    handleQuickProveedorInputChange,
    handleQuickProductoInputChange,
    handleQuickSucursalInputChange,
    handleCreateQuickProveedor,
    handleCreateQuickProducto,
    handleCreateQuickSucursal,
    eliminarCompra,
    recibirCompra,
    recibirCompraParcial,
    cancelarCompra,
    obtenerCompraDetalles
  } = useCompras();

  // Estados de UI
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState(null);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    searchTerm: "",
    searchType: "numeroFactura",
    estado: "TODOS",
    fechaInicio: "",
    fechaFin: ""
  });

  const { filteredCompras, filtrarCompras } = useComprasFilters();
  const comprasFiltradas = filtrarCompras(compras, filters);

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success, setSuccess]);

  const handleCreateCompra = async (compraData) => {
    return await handleSubmit(null, compraData);
  };

  const handleUpdateCompra = async (compraData) => {
    return await handleSubmit(null, compraData);
  };

  const handleEditCompra = (compra) => {
    handleEdit(compra);
  };

  const handleDeleteCompra = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta compra?")) {
      await eliminarCompra(id);
    }
  };

  const handleRecibirCompra = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas marcar esta compra como recibida?")) {
      await recibirCompra(id);
    }
  };

  // En el componente Compras, agrega esta función:
const handleRecibirCompraParcial = async (id, detallesRecepcion) => {
  const success = await recibirCompraParcial(id, detallesRecepcion);
  return success;
};

  const handleCancelarCompra = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas cancelar esta compra?")) {
      await cancelarCompra(id);
    }
  };

  const handleViewDetails = async (id) => {
    const compra = await obtenerCompraDetalles(id);
    if (compra) {
      setSelectedCompra(compra);
      setShowDetailsModal(true);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleNewCompra = () => {
    setShowForm(true);
    setEditingId(null);
    resetForm();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    cancelEdit();
  };

  if (loading && compras.length === 0) {
    return (
      <div className="compras-container">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span className="ms-3">Cargando compras...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      {/* Mensajes de alerta */}
      {error && (
        <MensajeAlerta 
          tipo="error" 
          mensaje={error} 
          onClose={() => setError("")} 
          duracion={5000}
        />
      )}
      {success && (
        <MensajeAlerta 
          tipo="exito" 
          mensaje={success} 
          onClose={() => setSuccess("")} 
          duracion={3000}
        />
      )}

      <div className="module-header">
        <div className="header-top">
          <h1>Gestión de Compras</h1>
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={handleNewCompra}
            >
              <i className="bi bi-plus-circle me-2"></i> Nueva Compra
            </button>
          </div>
        </div>

        <FiltersSection
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Formulario de compra */}
      {showForm && (
        <CompraForm
          compra={editingId ? compras.find(c => c.id === editingId) : null}
          onSubmit={editingId ? handleUpdateCompra : handleCreateCompra}
          onCancel={handleCancelForm}
          // Props para creación rápida
          showQuickProveedorModal={showQuickProveedorModal}
          showQuickProductoModal={showQuickProductoModal}
          showQuickSucursalModal={showQuickSucursalModal}
          quickProveedorFormData={quickProveedorFormData}
          quickProductoFormData={quickProductoFormData}
          quickSucursalFormData={quickSucursalFormData}
          onOpenQuickProveedorModal={() => setShowQuickProveedorModal(true)}
          onOpenQuickProductoModal={() => setShowQuickProductoModal(true)}
          onOpenQuickSucursalModal={() => setShowQuickSucursalModal(true)}
          onCloseQuickProveedorModal={() => setShowQuickProveedorModal(false)}
          onCloseQuickProductoModal={() => setShowQuickProductoModal(false)}
          onCloseQuickSucursalModal={() => setShowQuickSucursalModal(false)}
          onQuickProveedorInputChange={handleQuickProveedorInputChange}
          onQuickProductoInputChange={handleQuickProductoInputChange}
          onQuickSucursalInputChange={handleQuickSucursalInputChange}
          onCreateQuickProveedor={handleCreateQuickProveedor}
          onCreateQuickProducto={handleCreateQuickProducto}
          onCreateQuickSucursal={handleCreateQuickSucursal}
          categorias={categorias}
          unidadesMedida={unidadesMedida}
          // Listas actualizadas
          proveedores={proveedores}
          sucursales={sucursales}
          productos={productos}
        />
      )}

      {/* Tabla de compras */}
      <ComprasTable
        compras={comprasFiltradas}
        onEditCompra={handleEditCompra}
        onDeleteCompra={handleDeleteCompra}
        onRecibirCompra={handleRecibirCompra}
        onRecibirCompraParcial={handleRecibirCompraParcial}
        onCancelarCompra={handleCancelarCompra}
        onViewDetails={handleViewDetails}
      />

      {/* Modal de detalles */}
      {showDetailsModal && selectedCompra && (
        <CompraDetailsModal
          compra={selectedCompra}
          onClose={() => setShowDetailsModal(false)}
          onRecibirCompra={handleRecibirCompra}
          onCancelarCompra={handleCancelarCompra}
        />
      )}
    </div>
  );
}

export default Compras;