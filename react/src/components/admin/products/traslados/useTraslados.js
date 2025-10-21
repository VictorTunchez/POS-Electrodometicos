// components/products/hooks/useTraslados.js
import { useState, useEffect } from "react";
import servicioTraslados from "../../../../services/servicioTraslados";
import servicioProductos from "../../../../services/servicioProductos";
import servicioSucursales from "../../../../services/servicioSucursales";
import servicioUnidadesMedida from "../../../../services/servicioUnidadesMedida";
import servicioInventario from "../../../../services/servicioInventario"; // Importar servicio de inventario
import { handleApiError } from "../../../../utils/errorHandler";

export const useTraslados = () => {
  const [traslados, setTraslados] = useState([]);
  const [productos, setProductos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Nueva función para obtener stock real
  const obtenerStockProducto = async (productoId, sucursalId) => {
    try {
      if (!productoId || !sucursalId) return 0;
      
      const inventario = await servicioInventario.obtenerInventarioPorProductoSucursal(productoId, sucursalId);
      // El servicio devuelve un objeto de inventario, necesitamos stockActual
      return inventario?.stockActual || 0;
    } catch (err) {
      console.error("Error al obtener stock:", err);
      return 0;
    }
  };

  const cargarTraslados = async () => {
    try {
      setLoading(true);
      const [trasladosData, productosData, sucursalesData, unidadesData] = await Promise.all([
        servicioTraslados.obtenerTraslados(),
        servicioProductos.obtenerProductos(),
        servicioSucursales.obtenerSucursales(),
        servicioUnidadesMedida.obtenerUnidadesMedidaActivas()
      ]);

      setTraslados(trasladosData || []);
      setProductos(productosData || []);
      setSucursales(sucursalesData || []);
      setUnidadesMedida(unidadesData || []);
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al cargar los traslados");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const crearTraslado = async (trasladoData) => {
    try {
      setLoading(true);
      await servicioTraslados.crearTraslado(trasladoData);
      setSuccess("Traslado creado correctamente");
      await cargarTraslados();
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al crear el traslado");
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completarTraslado = async (id) => {
    try {
      await servicioTraslados.completarTraslado(id);
      setSuccess("Traslado completado correctamente");
      await cargarTraslados();
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al completar el traslado");
      setError(errorMessage);
      return false;
    }
  };

  const cancelarTraslado = async (id) => {
    try {
      await servicioTraslados.cancelarTraslado(id);
      setSuccess("Traslado cancelado correctamente");
      await cargarTraslados();
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al cancelar el traslado");
      setError(errorMessage);
      return false;
    }
  };

  const rechazarTraslado = async (id, motivo) => {
    try {
      await servicioTraslados.rechazarTraslado(id, motivo);
      setSuccess("Traslado rechazado correctamente");
      await cargarTraslados();
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al rechazar el traslado");
      setError(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    cargarTraslados();
  }, []);

  return {
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
    obtenerStockProducto // Exportar la nueva función
  };
};