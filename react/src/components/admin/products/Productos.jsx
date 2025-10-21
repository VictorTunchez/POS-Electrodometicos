import React, { useState, useEffect } from "react";
import { useProductosInventario } from "./hooks/useProductosInventario.js";
import { useProductosFilters } from "./hooks/UseProductosFilters.js";
import FiltersSection from "./components/FiltersSection.jsx";
import ProductosTable from "./components/ProductosTable/ProductosTable.jsx";
import ProductoForm from "./components/ProductoForm.jsx";
import InventarioForm from "./components/InventarioForm";
import ProductoDetailsModal from "./components/ProductoDetailsModal.jsx";
// NUEVOS COMPONENTES
import AjusteInventarioForm from "./components/AjusteInventarioForm.jsx";
import MovimientosModal from "./components/MovimientosModal.jsx";
// import LoadingState from "./components/LoadingState.jsx";
import MensajeAlerta from "../../MensajeAlerta";
import "./Productos.css";

function ProductosInventario() {
  const {
    productos,
    inventario,
    categorias,
    sucursales,
    unidadesMedida,
    loading,
    error,
    success,
    inventarioCargado,
    movimientos, // NUEVO: Movimientos del hook
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
    obtenerProductoDetalles,
    // NUEVO: Funciones para precios
    generarPreciosAutomaticos,
    obtenerInformacionMargen,
    // NUEVAS FUNCIONES: Ajustes y movimientos
    realizarAjusteInventario,
    cargarMovimientosPorProductoYSucursal
  } = useProductosInventario();

  // Estados de UI
  const [showForm, setShowForm] = useState(false);
  const [showInventarioForm, setShowInventarioForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  // NUEVOS ESTADOS: Para ajustes y movimientos
  const [showAjusteForm, setShowAjusteForm] = useState(false);
  const [showMovimientosModal, setShowMovimientosModal] = useState(false);
  
  // Estados de edición
  const [editingProducto, setEditingProducto] = useState(null);
  const [editingInventario, setEditingInventario] = useState(null);
  const [selectedProducto, setSelectedProducto] = useState(null);
  // NUEVOS ESTADOS: Para selección en ajustes y movimientos
  const [selectedForAjuste, setSelectedForAjuste] = useState(null);
  const [selectedForMovimientos, setSelectedForMovimientos] = useState(null);
  
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

  // Recargar datos cuando cambie el viewMode
  useEffect(() => {
    console.log(" Cambió viewMode a:", filters.viewMode);
    cargarDatos(filters.viewMode);
  }, [filters.viewMode]);

  // Handler de cambio de sucursal
  const handleSucursalChange = (sucursalId) => {
    setFilters(prev => ({ ...prev, selectedSucursal: sucursalId }));
    cargarInventario(sucursalId);
  };

  // Handlers de productos
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

  // NUEVOS HANDLERS: Para ajustes de inventario
  const handleAjustarInventario = (producto) => {
    setSelectedForAjuste({ producto });
    setShowAjusteForm(true);
  };

  const handleAjustarInventarioSucursal = (inventario) => {
    setSelectedForAjuste({ inventario });
    setShowAjusteForm(true);
  };

  const handleRealizarAjuste = async (ajusteData) => {
    const success = await realizarAjusteInventario(ajusteData);
    if (success) {
      setShowAjusteForm(false);
      setSelectedForAjuste(null);
    }
  };

  // NUEVOS HANDLERS: Para movimientos de inventario
  const handleViewMovimientos = (productoId) => {
    const producto = productos.find(p => p.id === productoId);
    setSelectedForMovimientos({ producto });
    setShowMovimientosModal(true);
  };

  const handleViewMovimientosSucursal = (inventario) => {
    const producto = productos.find(p => p.id === inventario.productoId);
    const sucursal = sucursales.find(s => s.id === inventario.sucursalId);
    setSelectedForMovimientos({ producto, sucursal });
    setShowMovimientosModal(true);
  };

  const handleCargarMovimientos = async (productoId, sucursalId) => {
    await cargarMovimientosPorProductoYSucursal(productoId, sucursalId);
  };

  // Handler para cambiar viewMode
  const handleViewModeChange = (nuevoModo) => {
    console.log("Cambiando a modo:", nuevoModo);
    setFilters(prev => ({ ...prev, viewMode: nuevoModo }));
  };

  // NUEVO: Handler para generar precios automáticos
  const handleGenerarPreciosAutomaticos = async (productoId, porcentajeMargen) => {
    if (window.confirm(`¿Generar precios automáticos con ${porcentajeMargen}% de margen?`)) {
      await generarPreciosAutomaticos(productoId, porcentajeMargen);
    }
  };

  // // Mostrar loading hasta que TODO esté cargado
  // if (loading || !inventarioCargado) {
  //   return <LoadingState message="Cargando productos e inventario..." />;
  // }

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

      {/* Formularios existentes */}
      {showForm && (
        <ProductoForm
          producto={editingProducto}
          categorias={categorias}
          unidadesMedida={unidadesMedida}
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

      {/* NUEVOS FORMULARIOS: Ajustes y movimientos */}
      {showAjusteForm && (
        <AjusteInventarioForm
          {...selectedForAjuste}
          sucursales={sucursales}
          onSubmit={handleRealizarAjuste}
          onCancel={() => {
            setShowAjusteForm(false);
            setSelectedForAjuste(null);
          }}
        />
      )}

      {showMovimientosModal && (
        <MovimientosModal
          {...selectedForMovimientos}
          movimientos={movimientos}
          sucursales={sucursales}
          onClose={() => {
            setShowMovimientosModal(false);
            setSelectedForMovimientos(null);
          }}
          onCargarMovimientos={handleCargarMovimientos}
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
        onViewDetails={handleViewDetails}
        // NUEVAS PROPS: Para ajustes y movimientos
        onAjustarInventario={handleAjustarInventario}
        onViewMovimientos={handleViewMovimientos}
        onAjustarInventarioSucursal={handleAjustarInventarioSucursal}
        onViewMovimientosSucursal={handleViewMovimientosSucursal}
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