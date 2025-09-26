import { useState, useEffect, useCallback } from "react";
import servicioProductos from "../../../../services/servicioProductos";
import servicioInventario from "../../../../services/servicioInventario";
import servicioCategorias from "../../../../services/servicioCategorias";
import servicioSucursales from "../../../../services/servicioSucursales";
import { handleApiError } from "../../../../utils/errorHandler";

export const useProductosInventario = () => {
  const [productos, setProductos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inventarioCargado, setInventarioCargado] = useState(false);

  // NUEVO: Método para cargar productos según el viewMode
  const cargarProductosSegunModo = async (viewMode = "activos") => {
    try {
      console.log("Cargando productos en modo:", viewMode);

      let productosData;
      if (viewMode === "todos") {
        productosData = await servicioProductos.obtenerTodosProductos();
      } else {
        productosData = await servicioProductos.obtenerProductos();
      }
      
      setProductos(productosData || []);
      console.log("Productos cargados:", productosData?.length, "en modo", viewMode);
      return productosData || [];
    } catch (err) {
      console.error("Error cargando productos:", err);
      setProductos([]);
      return [];
    }
  };

  const cargarDatos = useCallback(async (viewMode = "activos") => {
    try {
      setLoading(true);
      setError("");
      setInventarioCargado(false);

      console.log("Iniciando carga completa de datos en modo:", viewMode);

      // MODIFICADO: Cargar productos según el viewMode
      const [productosData, categoriasData, sucursalesData] = await Promise.all([
        cargarProductosSegunModo(viewMode),
        servicioCategorias.obtenerCategorias().catch(err => {
          console.error("Error cargando categorías:", err);
          return [];
        }),
        servicioSucursales.obtenerSucursales().catch(err => {
          console.error("Error cargando sucursales:", err);
          return [];
        })
      ]);

      setProductos(productosData || []);
      setCategorias(categoriasData || []);
      setSucursales(sucursalesData || []);

      console.log("Datos básicos cargados, cargando inventario...");
      await cargarInventario();

    } catch (err) {
      console.error("Error general al cargar datos:", err);
      const errorMessage = handleApiError(err, "Error al cargar los datos");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // NUEVO: Método para recargar solo productos (más rápido)
  const recargarProductos = async (viewMode = "activos") => {
    try {
      console.log("Recargando productos en modo:", viewMode);
      await cargarProductosSegunModo(viewMode);
    } catch (err) {
      console.error("Error recargando productos:", err);
    }
  };

  const cargarInventario = async (sucursalId = "TODAS") => {
    try {
      console.log("Cargando inventario para sucursal:", sucursalId);
      
      let datos;
      if (sucursalId === "TODAS") {
        datos = await servicioInventario.obtenerTodoInventario();
      } else {
        datos = await servicioInventario.obtenerInventarioPorSucursal(parseInt(sucursalId));
      }
      
      setInventario(datos || []);
      setInventarioCargado(true);
      console.log("Inventario cargado:", datos?.length, "registros");
      
    } catch (err) {
      console.error("Error cargando inventario:", err);
      setInventario([]);
      setInventarioCargado(true);
    }
  };

  const crearProducto = async (productoData) => {
    try {
      const datosEnviar = {
        ...productoData,
        precioCompra: parseFloat(productoData.precioCompra) || 0,
        precioVenta: parseFloat(productoData.precioVenta) || 0,
        categoriaId: parseInt(productoData.categoriaId) || null,
        destacado: productoData.destacado || false
      };
      
      await servicioProductos.crearProducto(datosEnviar);
      setSuccess("Producto creado correctamente");
      await recargarProductos("activos");
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al crear el producto");
      setError(errorMessage);
      return false;
    }
  };

  const actualizarProducto = async (id, productoData) => {
    try {
      const datosEnviar = {
        ...productoData,
        precioCompra: parseFloat(productoData.precioCompra) || 0,
        precioVenta: parseFloat(productoData.precioVenta) || 0,
        categoriaId: parseInt(productoData.categoriaId) || null,
        destacado: productoData.destacado || false
      };
      
      await servicioProductos.actualizarProducto(id, datosEnviar);
      setSuccess("Producto actualizado correctamente");
      await recargarProductos("activos");
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al actualizar el producto");
      setError(errorMessage);
      return false;
    }
  };

  const eliminarProducto = async (id, viewMode = "activos") => {
    try {
      // 1. Buscar el producto a eliminar
      const producto = productos.find(p => p.id === id);
      if (!producto) {
        setError("Producto no encontrado");
        return false;
      }

      // 2. Verificar si el producto tiene inventario
      const tieneInventario = inventario.some(inv => 
        inv.productoId === id || inv.productoId?.toString() === id?.toString()
      );

      if (tieneInventario) {
        setError(`No se puede eliminar el producto porque tiene inventario registrado`);
        return false;
      }

      // 3. Confirmación de eliminación
      if (!window.confirm(`¿Estás seguro de que deseas eliminar el producto "${producto.nombreProducto}"? Esta acción no se puede deshacer.`)) {
        return false;
      }

      // 4. Ejecutar eliminación
      console.log("Eliminando producto:", id);
      await servicioProductos.eliminarProducto(id);
      
      // 5. Recargar datos manteniendo el viewMode actual
      setSuccess(`Producto "${producto.nombreProducto}" eliminado correctamente`);
      await recargarProductos(viewMode);
      
      return true;

    } catch (err) {
      console.error("Error eliminando producto:", err);
      
      let errorMessage = "Error al eliminar el producto";
      
      if (err.response?.status === 409) {
        errorMessage = "No se puede eliminar el producto porque tiene registros asociados (inventario)";
      } else if (err.response?.status === 404) {
        errorMessage = "Producto no encontrado";
      } else if (err.message?.includes('constraint') || err.message?.includes('llave')) {
        errorMessage = "No se puede eliminar el producto porque tiene inventario registrado. Elimine primero el inventario.";
      } else {
        errorMessage = handleApiError(err, "Error al eliminar el producto");
      }
      
      setError(errorMessage);
      return false;
    }
  };

  const restaurarProducto = async (id, viewMode = "activos") => {
    try {
      console.log("Restaurando producto:", id);
      await servicioProductos.restaurarProducto(id);
      setSuccess("Producto restaurado correctamente");
      await recargarProductos(viewMode);
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al restaurar el producto");
      setError(errorMessage);
      return false;
    }
  };

  const crearInventario = async (inventarioData) => {
    try {
      const datosEnviar = {
        productoId: parseInt(inventarioData.productoId),
        sucursalId: parseInt(inventarioData.sucursalId),
        stockActual: parseInt(inventarioData.stockActual) || 0,
        stockMinimo: parseInt(inventarioData.stockMinimo) || 0
      };
      
      await servicioInventario.crearInventario(datosEnviar);
      setSuccess("Registro de inventario creado correctamente");
      await cargarInventario();
      await recargarProductos("activos");
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al crear el inventario");
      setError(errorMessage);
      return false;
    }
  };

  const actualizarInventario = async (id, inventarioData) => {
    try {
      const datosEnviar = {
        productoId: parseInt(inventarioData.productoId),
        sucursalId: parseInt(inventarioData.sucursalId),
        stockActual: parseInt(inventarioData.stockActual) || 0,
        stockMinimo: parseInt(inventarioData.stockMinimo) || 0
      };
      
      await servicioInventario.actualizarInventario(id, datosEnviar);
      setSuccess("Inventario actualizado correctamente");
      await cargarInventario();
      await recargarProductos("activos");
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al actualizar el inventario");
      setError(errorMessage);
      return false;
    }
  };

  const eliminarInventario = async (id) => {
    try {
      await servicioInventario.eliminarInventario(id);
      setSuccess("Registro de inventario eliminado correctamente");
      await cargarInventario();
      await recargarProductos("activos");
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al eliminar el inventario");
      setError(errorMessage);
      return false;
    }
  };

  const ajustarStock = async (inventarioId, cantidad) => {
    try {
      await servicioInventario.ajustarStock(inventarioId, cantidad);
      setSuccess("Stock ajustado correctamente");
      await cargarInventario();
      await recargarProductos("activos");
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al ajustar el stock");
      setError(errorMessage);
      return false;
    }
  };

  const obtenerProductoDetalles = async (id) => {
    try {
      return await servicioProductos.obtenerProductoPorId(id);
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al obtener detalles");
      setError(errorMessage);
      return null;
    }
  };

  useEffect(() => {
    cargarDatos("activos");
  }, []);

  return {
    // Estados
    productos,
    inventario,
    categorias,
    sucursales,
    loading,
    error,
    success,
    inventarioCargado,
    
    // Setters
    setError,
    setSuccess,
    
    // Acciones
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
  };
};