import React, { useState, useEffect } from "react";
import { useClientes } from "./useClientes";
import { useClientesFilters } from "./useClientesFilters";
import FiltersSection from "./FiltersSection";
import ClientesTable from "./ClientesTable";
import ClienteForm from "./ClienteForm";
import ClienteDetailsModal from "./ClientesDetailModal";
// import LoadingState from "../products/components/LoadingState";
import MensajeAlerta from "../../MensajeAlerta";
import "./Clientes.css";

function Clientes() {
  const {
    clientes,
    loading,
    error,
    success,
    setError,
    setSuccess,
    cargarDatos,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    obtenerClienteDetalles
  } = useClientes();

  // Estados de UI
  const [showForm, setShowForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Estados de edición
  const [editingCliente, setEditingCliente] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    searchTerm: "",
    searchType: "nombre",
    tipoDocumento: "TODOS"
  });

  const { filtrarClientes } = useClientesFilters();
  const clientesFiltrados = filtrarClientes(clientes, filters);

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

  const handleCreateCliente = async (clienteData) => {
    const success = await crearCliente(clienteData);
    if (success) {
      setShowForm(false);
    }
  };

  const handleUpdateCliente = async (clienteData) => {
    const success = await actualizarCliente(editingCliente.id, clienteData);
    if (success) {
      setShowForm(false);
      setEditingCliente(null);
    }
  };

  const handleEditCliente = (cliente) => {
    setEditingCliente(cliente);
    setShowForm(true);
  };

  const handleDeleteCliente = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      await eliminarCliente(id);
    }
  };

  const handleViewDetails = async (id) => {
    const cliente = await obtenerClienteDetalles(id);
    if (cliente) {
      setSelectedCliente(cliente);
      setShowDetailsModal(true);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // if (loading && clientes.length === 0) {
  //   return <LoadingState message="Cargando clientes..." />;
  // }

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
          <h1>Gestión de Clientes</h1>
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <i className="bi bi-plus-circle me-2"></i> Nuevo Cliente
            </button>
          </div>
        </div>

        <FiltersSection
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Formulario de cliente */}
      {showForm && (
        <ClienteForm
          cliente={editingCliente}
          onSubmit={editingCliente ? handleUpdateCliente : handleCreateCliente}
          onCancel={() => {
            setShowForm(false);
            setEditingCliente(null);
          }}
        />
      )}

      {/* Tabla de clientes */}
      <ClientesTable
        clientes={clientesFiltrados}
        onEditCliente={handleEditCliente}
        onDeleteCliente={handleDeleteCliente}
        onViewDetails={handleViewDetails}
      />

      {/* Modal de detalles */}
      {showDetailsModal && selectedCliente && (
        <ClienteDetailsModal
          cliente={selectedCliente}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
}

export default Clientes;