import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useVentas } from "./useVentas.js";
import { useVentasFilters } from "./useVentasFilters.js";
import FiltersSection from "./FilterSection.jsx";
import VentasTable from "./VentasTable.jsx";
import VentaForm from "./VentaForm.jsx";
import VentaDetailsModal from "./VentaDetail.jsx";
import ConfirmacionVentaModal from "./ConfirmacionVentaModal.jsx";
import MensajeAlerta from "../../MensajeAlerta.jsx";
import "./Ventas.css";
import StripeCheckout from "./StripeCheckout.jsx";

function Ventas() {
  const location = useLocation();
  const navigate = useNavigate();
  const stripeProcesadoRef = useRef(false);
  
  const {
    ventas,
    loading,
    error,
    success,
    pendingStripeVenta,
    setError,
    setSuccess,
    setPendingStripeVenta,
    cargarDatos,
    recargarVentas,
    crearVenta,
    actualizarVenta,
    eliminarVenta,
    cancelarVenta,
    obtenerVentaDetalles,
    confirmarPagoStripe,
    descargarFacturaPdf,
    descargarTicketPdf
  } = useVentas();

  // Estados de UI
  const [showForm, setShowForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [showConfirmacionModal, setShowConfirmacionModal] = useState(false);
  const [ventaReciente, setVentaReciente] = useState(null);
  const [procesandoStripe, setProcesandoStripe] = useState(false);
  
  // Estados de edición
  const [editingVenta, setEditingVenta] = useState(null);
  const [selectedVenta, setSelectedVenta] = useState(null);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    searchTerm: "",
    searchType: "numeroFactura",
    estado: "TODOS",
    formaPago: "TODOS",
    tipoVenta: "TODOS",
    fechaInicio: "",
    fechaFin: ""
  });

  const { filtrarVentas } = useVentasFilters();
  const ventasFiltradas = filtrarVentas(ventas, filters);

  // Manejar el retorno directo de Stripe
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const manejarRetornoStripe = async () => {
      const stripeSuccess = searchParams.get('stripe_success');
      const sessionId = searchParams.get('session_id');
      const stripeCancel = searchParams.get('stripe_cancel');

      // Si ya procesamos este retorno, salir inmediatamente
      if (stripeProcesadoRef.current) {
        console.log("Retorno de Stripe ya procesado, ignorando...");
        navigate('/panel/ventas', { replace: true });
        return;
      }

      if (stripeCancel) {
        stripeProcesadoRef.current = true;
        setError('El pago fue cancelado. La venta sigue en estado pendiente.');
        navigate('/panel/ventas', { replace: true });
        return;
      }

      if (stripeSuccess && sessionId && !procesandoStripe) {
        stripeProcesadoRef.current = true;
        setProcesandoStripe(true);
        console.log("Procesando retorno directo de Stripe con sessionId:", sessionId);
        
        try {
          setSuccess('Confirmando pago con Stripe...');
          
          // Confirmar el pago con Stripe
          const ventaConfirmada = await confirmarPagoStripe(sessionId);
          
          if (ventaConfirmada) {
            console.log("Pago confirmado exitosamente:", ventaConfirmada);
            
            // Mostrar modal de confirmación
            setVentaReciente(ventaConfirmada);
            setShowConfirmacionModal(true);
            setSuccess('¡Pago con tarjeta procesado exitosamente!');
          } else {
            console.log("No se recibió venta confirmada, pero el pago fue exitoso");
            // Si no hay venta confirmada pero no hay error, asumimos éxito
            await recargarVentas();
            
            // Buscar la venta más reciente con tarjeta en estado COMPLETADA
            const ventasRecientes = [...ventas].sort((a, b) => 
              new Date(b.fechaVenta) - new Date(a.fechaVenta)
            );
            
            const ventaTarjetaReciente = ventasRecientes.find(v => 
              v.formaPago === 'TARJETA' && 
              v.estado === 'COMPLETADA' &&
              new Date(v.fechaVenta).getTime() > Date.now() - 300000 // Últimos 5 minutos
            );
            
            if (ventaTarjetaReciente) {
              setVentaReciente(ventaTarjetaReciente);
              setShowConfirmacionModal(true);
              setSuccess('¡Pago con tarjeta procesado exitosamente!');
            } else {
              setSuccess('¡Pago con tarjeta procesado exitosamente!');
            }
          }
        } catch (err) {
          console.error("Error al procesar retorno de Stripe:", err);
          // NO establecer error aquí, ya que confirmarPagoStripe ya lo hace
        } finally {
          setProcesandoStripe(false);
          // Limpiar URL
          navigate('/panel/ventas', { replace: true });
        }
      }
    };

    manejarRetornoStripe();
  }, [location.search, confirmarPagoStripe, setSuccess, setError, navigate, procesandoStripe, recargarVentas, ventas]);

  // Resetear la referencia cuando cambia la ubicación
  useEffect(() => {
    stripeProcesadoRef.current = false;
  }, [location.pathname]);

  // Efecto para mostrar el modal de Stripe cuando hay una venta pendiente
  useEffect(() => {
    if (pendingStripeVenta) {
      setShowStripeCheckout(true);
    }
  }, [pendingStripeVenta]);

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

  const handleCreateVenta = async (ventaData) => {
    const response = await crearVenta(ventaData);
    if (response && ventaData.formaPago !== 'TARJETA') {
      // Para ventas en efectivo, mostrar modal de confirmación inmediatamente
      setVentaReciente(response);
      setShowConfirmacionModal(true);
      setShowForm(false);
    }
    return response;
  };

  const handleUpdateVenta = async (ventaData) => {
    const success = await actualizarVenta(editingVenta.id, ventaData);
    if (success) {
      setShowForm(false);
      setEditingVenta(null);
    }
  };

  const handleEditVenta = (venta) => {
    setEditingVenta(venta);
    setShowForm(true);
  };

  const handleDeleteVenta = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta venta?")) {
      await eliminarVenta(id);
    }
  };

  const handleCancelarVenta = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas cancelar esta venta?")) {
      await cancelarVenta(id);
    }
  };

  const handleViewDetails = async (id) => {
    const venta = await obtenerVentaDetalles(id);
    if (venta) {
      setSelectedVenta(venta);
      setShowDetailsModal(true);
    }
  };

  const handleDownloadFactura = async (id) => {
    await descargarFacturaPdf(id);
  };

  const handleDownloadTicket = async (id) => {
    await descargarTicketPdf(id);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleStripeSuccess = () => {
    setShowStripeCheckout(false);
    setPendingStripeVenta(null);
    setSuccess('Redirigiendo a Stripe...');
  };

  const handleStripeCancel = () => {
    setShowStripeCheckout(false);
    setPendingStripeVenta(null);
    setError('El pago fue cancelado. La venta sigue en estado pendiente.');
  };

  const handleStripeError = (errorMessage) => {
    setShowStripeCheckout(false);
    setPendingStripeVenta(null);
    setError(errorMessage);
  };

  const handleCloseConfirmacionModal = () => {
    setShowConfirmacionModal(false);
    setVentaReciente(null);
    // Recargar las ventas después de cerrar el modal
    recargarVentas();
  };

  // Mostrar loading mientras se procesa Stripe
  if (procesandoStripe) {
    return (
      <div className="module-container">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p>Confirmando pago con Stripe...</p>
          </div>
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
          <h1>Gestión de Ventas</h1>
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <i className="bi bi-plus-circle me-2"></i> Nueva Venta
            </button>
          </div>
        </div>

        <FiltersSection
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Formulario de venta */}
      {showForm && (
        <VentaForm
          venta={editingVenta}
          onSubmit={editingVenta ? handleUpdateVenta : handleCreateVenta}
          onCancel={() => {
            setShowForm(false);
            setEditingVenta(null);
          }}
        />
      )}

      {/* Tabla de ventas */}
      <VentasTable
        ventas={ventasFiltradas}
        onEditVenta={handleEditVenta}
        onDeleteVenta={handleDeleteVenta}
        onCancelarVenta={handleCancelarVenta}
        onViewDetails={handleViewDetails}
        onDownloadFactura={handleDownloadFactura}
        onDownloadTicket={handleDownloadTicket}
      />

      {/* Modal de detalles */}
      {showDetailsModal && selectedVenta && (
        <VentaDetailsModal
          venta={selectedVenta}
          onClose={() => setShowDetailsModal(false)}
          onCancelarVenta={handleCancelarVenta}
          onDownloadFactura={handleDownloadFactura}
          onDownloadTicket={handleDownloadTicket}
        />
      )}

      {/* Modal de confirmación de venta */}
      {showConfirmacionModal && ventaReciente && (
        <ConfirmacionVentaModal
          venta={ventaReciente}
          onClose={handleCloseConfirmacionModal}
          onDownloadFactura={handleDownloadFactura}
          onDownloadTicket={handleDownloadTicket}
        />
      )}

      {/* Modal de Stripe Checkout */}
      {showStripeCheckout && pendingStripeVenta && (
        <StripeCheckout
          venta={pendingStripeVenta}
          onSuccess={handleStripeSuccess}
          onCancel={handleStripeCancel}
          onError={handleStripeError}
        />
      )}
    </div>
  );
}

export default Ventas;