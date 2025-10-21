import axios from 'axios';

// URL base de la API
const URL_API = '';


// Función para formatear números consistentemente
const formatoMoneda = new Intl.NumberFormat('es-GT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const formatoEntero = new Intl.NumberFormat('es-GT');

const obtenerEstadisticasDashboard = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No hay token disponible");

    const respuesta = await axios.get(`${URL_API}/api/dashboard/estadisticas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000
    });
    
    // Procesar los datos para formateo consistente
    const datos = respuesta.data;
    
    // Asegurar que todos los valores numéricos estén formateados correctamente
    return {
      ...datos,
      // Los valores monetarios ya vienen formateados del backend como strings
      ventasHoy: datos.ventasHoy || "0.00",
      comprasMes: datos.comprasMes || "0.00",
      metaVentas: datos.metaVentas || "50,000.00",
      // Valores numéricos
      totalClientes: datos.totalClientes || 0,
      totalProductos: datos.totalProductos || 0,
      stockBajo: datos.stockBajo || 0,
      ventasHoyCount: datos.ventasHoyCount || 0,
      tendenciaVentas: datos.tendenciaVentas || 0,
      clientesNuevosMes: datos.clientesNuevosMes || 0,
      totalSucursales: datos.totalSucursales || 0,
      ultimaCompra: datos.ultimaCompra || "N/A",
      productosPopulares: datos.productosPopulares || [],
      ventasPorSucursal: datos.ventasPorSucursal || []
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    // Retornar solo valores cero, sin datos de ejemplo
    return {
      ventasHoy: "0.00",
      totalClientes: 0,
      totalProductos: 0,
      stockBajo: 0,
      comprasMes: "0.00",
      ventasHoyCount: 0,
      tendenciaVentas: 0,
      clientesNuevosMes: 0,
      ultimaCompra: "N/A",
      metaVentas: "50,000.00",
      totalSucursales: 0,
      productosPopulares: [],
      ventasPorSucursal: []
    };
  }
};

const descargarReporte = async (tipoReporte) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No hay token disponible");

    const respuesta = await axios.get(
      `${URL_API}/api/dashboard/reportes/${tipoReporte}?formato=pdf`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
        timeout: 30000
      }
    );
    return respuesta.data;
  } catch (error) {
    console.error('Error al descargar reporte:', error);
    throw error;
  }
};

export default {
  obtenerEstadisticasDashboard,
  descargarReporte
};