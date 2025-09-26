import React, { useState, useEffect } from "react";
import { useProductosInventario } from "./hooks/useProductosInventario";
import { useProductosFilters } from "./hooks/seProductosFilters";
import FiltersSection from "./components/FiltersSection";
import ProductosTable from "./components/ProductosTable";
import ProductoForm from "./components/ProductoForm";
import InventarioForm from "./components/InventarioForm";
import ProductoDetailsModal from "./components/ProductoDetailsModal";
import LoadingState from "./components/LoadingState";
import MensajeAlerta from "../../MensajeAlerta";
import "./ProductosInventario.css";

function ProductosInventario() {
  const {
    productos,
    inventario,
    categorias,
    sucursales,
    loading,
    error,
    success,
    inventarioCargado,
    setError,
    setSuccess,
    cargarDatos,
    cargarInventario,
    recargarProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    restaurarProducto,
    crearInventario,
    actualizarInventario,
    eliminarInventario,
    ajustarStock,
    obtenerProductoDetalles
  } = useProductosInventario();

  // Estados de UI
  const [showForm, setShowForm] = useState(false);
  const [showInventarioForm, setShowInventarioForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Estados de edición
  const [editingProducto, setEditingProducto] = useState(null);
  const [editingInventario, setEditingInventario] = useState(null);
  const [selectedProducto, setSelectedProducto] = useState(null);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    searchTerm: "",
    filterCategoria: "TODAS",
    filterDestacados: false,
    stockFilter: "TODOS",
    viewMode: "activos",
    selectedSucursal: "TODAS"
  });

  const { productosConInventario, obtenerNombreSucursal, filtrarProductos } = 
    useProductosFilters(
      productos, 
      inventario, 
      categorias, 
      sucursales, 
      filters.selectedSucursal,
      inventarioCargado
    );

  // Aplicar filtros
  const filteredProductos = filtrarProductos(productosConInventario, filters);

  // NUEVO: Recargar datos cuando cambie el viewMode
  useEffect(() => {
    console.log(" Cambió viewMode a:", filters.viewMode);
    cargarDatos(filters.viewMode);
  }, [filters.viewMode]);

  // Handler de cambio de sucursal
  const handleSucursalChange = (sucursalId) => {
    setFilters(prev => ({ ...prev, selectedSucursal: sucursalId }));
    cargarInventario(sucursalId);
  };

  // MODIFICADO: Handlers que pasan el viewMode actual
  const handleCreateProducto = async (productoData) => {
    const success = await crearProducto(productoData);
    if (success) {
      setShowForm(false);
      setEditingProducto(null);
    }
  };

  const handleUpdateProducto = async (productoData) => {
    const success = await actualizarProducto(editingProducto.id, productoData);
    if (success) {
      setShowForm(false);
      setEditingProducto(null);
    }
  };

  const handleEditProducto = (producto) => {
    setEditingProducto(producto);
    setShowForm(true);
  };

  const handleDeleteProducto = async (id) => {
    await eliminarProducto(id, filters.viewMode);
  };

  const handleRestoreProducto = async (id) => {
    await restaurarProducto(id, filters.viewMode);
  };

  // Handlers de inventario
  const handleCreateInventario = async (inventarioData) => {
    const success = await crearInventario(inventarioData);
    if (success) {
      setShowInventarioForm(false);
      setEditingInventario(null);
    }
  };

  const handleUpdateInventario = async (inventarioData) => {
    const success = await actualizarInventario(editingInventario.id, inventarioData);
    if (success) {
      setShowInventarioForm(false);
      setEditingInventario(null);
    }
  };

  const handleEditInventario = (inventarioItem) => {
    setEditingInventario(inventarioItem);
    setShowInventarioForm(true);
  };

  const handleDeleteInventario = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este registro de inventario?")) {
      await eliminarInventario(id);
    }
  };

  const handleAjustarStock = async (inventarioId, cantidad) => {
    await ajustarStock(inventarioId, cantidad);
  };

  // Handler de detalles
  const handleViewDetails = async (id) => {
    const producto = await obtenerProductoDetalles(id);
    if (producto) {
      setSelectedProducto({
        ...producto,
        inventario: inventario.filter(inv => 
          inv.productoId === producto.id || inv.productoId === producto.id.toString()
        )
      });
      setShowDetailsModal(true);
    }
  };

  // NUEVO: Handler para cambiar viewMode
  const handleViewModeChange = (nuevoModo) => {
    console.log("Cambiando a modo:", nuevoModo);
    setFilters(prev => ({ ...prev, viewMode: nuevoModo }));
  };

  // Mostrar loading hasta que TODO esté cargado
  if (loading || !inventarioCargado) {
    return <LoadingState message="Cargando productos e inventario..." />;
  }

  return (
    <div className="module-container">
      {error && <MensajeAlerta tipo="error" mensaje={error} onClose={() => setError("")} />}
      {success && <MensajeAlerta tipo="exito" mensaje={success} onClose={() => setSuccess("")} />}

      <div className="module-header">
        <div className="header-top">
          <h1>
            Gestión de Productos e Inventario
            {!inventarioCargado && <small className="text-muted ms-2">(Cargando inventario...)</small>}
          </h1>
          <div className="button-group">
            <button
              className="btn btn-success"
              onClick={() => setShowInventarioForm(true)}
              disabled={!inventarioCargado}
            >
              <i className="bi bi-clipboard-plus me-2"></i> Nuevo Inventario
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <i className="bi bi-plus-circle me-2"></i> Nuevo Producto
            </button>
          </div>
        </div>

        <FiltersSection
          filters={filters}
          categorias={categorias}
          sucursales={sucursales}
          onFiltersChange={setFilters}
          onSucursalChange={handleSucursalChange}
          onViewModeChange={handleViewModeChange}
          inventarioCargado={inventarioCargado}
        />
      </div>

      {/* Formularios */}
      {showForm && (
        <ProductoForm
          producto={editingProducto}
          categorias={categorias}
          onSubmit={editingProducto ? handleUpdateProducto : handleCreateProducto}
          onCancel={() => {
            setShowForm(false);
            setEditingProducto(null);
          }}
        />
      )}

      {showInventarioForm && (
        <InventarioForm
          inventario={editingInventario}
          productos={productos.filter(p => p.activo !== false)}
          sucursales={sucursales}
          onSubmit={editingInventario ? handleUpdateInventario : handleCreateInventario}
          onCancel={() => {
            setShowInventarioForm(false);
            setEditingInventario(null);
          }}
        />
      )}

      {/* Tabla de productos */}
      <ProductosTable
        productos={filteredProductos}
        selectedSucursal={filters.selectedSucursal}
        sucursales={sucursales}
        obtenerNombreSucursal={obtenerNombreSucursal}
        onEditProducto={handleEditProducto}
        onDeleteProducto={handleDeleteProducto}
        onRestoreProducto={handleRestoreProducto}
        onEditInventario={handleEditInventario}
        onDeleteInventario={handleDeleteInventario}
        onAjustarStock={handleAjustarStock}
        onViewDetails={handleViewDetails}
      />

      {/* Modal de detalles */}
      {showDetailsModal && selectedProducto && (
        <ProductoDetailsModal
          producto={selectedProducto}
          categorias={categorias}
          sucursales={sucursales}
          obtenerNombreSucursal={obtenerNombreSucursal}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
}

export default ProductosInventario;