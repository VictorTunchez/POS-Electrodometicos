import { useState, useEffect } from 'react';
import comprasService from '../../../services/servicioCompras';
import servicioProveedores from '../../../services/servicioProveedores';
import servicioSucursales from '../../../services/servicioSucursales';
import servicioProductos from '../../../services/servicioProductos';
import servicioUnidadesMedida from '../../../services/servicioUnidadesMedida';
import servicioCategorias from '../../../services/servicioCategorias';
import { handleApiError } from '../../../utils/errorHandler';

export const useCompras = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para el formulario de compra - CORREGIDOS A NÚMEROS
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    numeroFactura: "",
    numeroControl: "",
    proveedorId: 0,  // Cambiado a número
    sucursalId: 0,   // Cambiado a número
    fechaCompra: new Date().toISOString().split('T')[0],
    observaciones: "",
    detalles: []
  });

  // Estados para datos de selects
  const [proveedores, setProveedores] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [productos, setProductos] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Estados para creación rápida
  const [showQuickProveedorModal, setShowQuickProveedorModal] = useState(false);
  const [showQuickProductoModal, setShowQuickProductoModal] = useState(false);
  const [showQuickSucursalModal, setShowQuickSucursalModal] = useState(false);

  // Estados para formularios rápidos
  const [quickProveedorFormData, setQuickProveedorFormData] = useState({
    razonSocial: "",
    ruc: "",
    direccion: "",
    telefono: "",
    email: "",
    contacto: ""
  });

  const [quickProductoFormData, setQuickProductoFormData] = useState({
    nombreProducto: "",
    codigoBarras: "",
    descripcion: "",
    imagen: "",
    categoriaId: "",
    unidadMedidaId: "",
    unidadCompraId: "",
    factorConversion: "",
    margenDefault: "30",
    destacado: false,
    generarPreciosAutomaticos: true
  });

  const [quickSucursalFormData, setQuickSucursalFormData] = useState({
    nombreSucursal: "",
    direccion: "",
    telefono: ""
  });

  // Cargar datos iniciales
  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const [comprasData, proveedoresData, sucursalesData, productosData, unidadesData, categoriasData] = await Promise.all([
        comprasService.obtenerCompras(),
        servicioProveedores.obtenerProveedores(),
        servicioSucursales.obtenerSucursales(),
        servicioProductos.obtenerProductos(),
        servicioUnidadesMedida.obtenerUnidadesMedidaActivas(),
        servicioCategorias.obtenerCategorias()
      ]);
      
      setCompras(comprasData);
      setProveedores(proveedoresData);
      setSucursales(sucursalesData);
      setProductos(productosData);
      setUnidadesMedida(unidadesData);
      setCategorias(categoriasData);
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al cargar los datos');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const recargarCompras = async () => {
    await cargarDatos();
  };

  // Funciones para recargar listas específicas
  const recargarProveedores = async () => {
    try {
      const proveedoresActualizados = await servicioProveedores.obtenerProveedores();
      setProveedores(proveedoresActualizados);
    } catch (error) {
      console.error("Error al recargar proveedores:", error);
    }
  };

  const recargarProductos = async () => {
    try {
      const productosActualizados = await servicioProductos.obtenerProductos();
      setProductos(productosActualizados);
    } catch (error) {
      console.error("Error al recargar productos:", error);
    }
  };

  const recargarSucursales = async () => {
    try {
      const sucursalesActualizadas = await servicioSucursales.obtenerSucursales();
      setSucursales(sucursalesActualizadas);
    } catch (error) {
      console.error("Error al recargar sucursales:", error);
    }
  };

  // Handlers para el formulario principal de compra - CORREGIDOS
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convertir a número si el campo es proveedorId o sucursalId
    let finalValue = value;
    if (name === 'proveedorId' || name === 'sucursalId') {
      finalValue = value === "" ? 0 : parseInt(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleDetalleChange = (index, field, value) => {
    const nuevosDetalles = [...formData.detalles];
    
    if (field === 'cantidad' || field === 'costoUnitario' || field === 'impuesto' || field === 'descuento') {
      const numericValue = value === "" ? 0 : parseFloat(value) || 0;
      nuevosDetalles[index] = {
        ...nuevosDetalles[index],
        [field]: numericValue
      };
    } else if (field === 'productoId' || field === 'unidadMedidaId') {
      // Convertir IDs a números
      const numericValue = value === "" ? 0 : parseInt(value) || 0;
      nuevosDetalles[index] = {
        ...nuevosDetalles[index],
        [field]: numericValue
      };
    } else {
      nuevosDetalles[index] = {
        ...nuevosDetalles[index],
        [field]: value
      };
    }

    // Recalcular subtotales
    const cantidad = parseFloat(nuevosDetalles[index].cantidad) || 0;
    const costoUnitario = parseFloat(nuevosDetalles[index].costoUnitario) || 0;
    const impuesto = parseFloat(nuevosDetalles[index].impuesto) || 0;
    const descuento = parseFloat(nuevosDetalles[index].descuento) || 0;

    const subtotal = cantidad * costoUnitario;
    const total = subtotal + impuesto - descuento;

    nuevosDetalles[index] = {
      ...nuevosDetalles[index],
      subtotal: subtotal,
      total: total
    };

    setFormData(prev => ({
      ...prev,
      detalles: nuevosDetalles
    }));
  };

  const agregarDetalle = () => {
    setFormData(prev => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        {
          productoId: 0,        // Cambiado a número
          unidadMedidaId: 0,    // Cambiado a número
          cantidad: 0,
          costoUnitario: 0,
          impuesto: 0,
          descuento: 0,
          subtotal: 0,
          total: 0
        }
      ]
    }));
  };

  const eliminarDetalle = (index) => {
    const nuevosDetalles = formData.detalles.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      detalles: nuevosDetalles
    }));
  };

  // NUEVA FUNCIÓN: Procesar compra de forma genérica
  const procesarCompra = async (compraData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await comprasService.actualizarCompra(editingId, compraData);
        setSuccess('Compra actualizada correctamente');
      } else {
        await comprasService.registrarCompra(compraData);
        setSuccess('Compra registrada correctamente');
      }

      setShowForm(false);
      resetForm();
      await cargarDatos();
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al guardar la compra');
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // handleSubmit modificado para aceptar llamadas directas
  const handleSubmit = async (e, compraData = null) => {
    // Si se proporcionan datos directamente, usarlos
    if (compraData) {
      return await procesarCompra(compraData);
    }
    
    // Si no, es el evento del formulario normal
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const compraData = {
        numeroFactura: formData.numeroFactura,
        numeroControl: formData.numeroControl,
        proveedorId: formData.proveedorId,
        sucursalId: formData.sucursalId,
        fechaCompra: new Date(formData.fechaCompra).toISOString(),
        observaciones: formData.observaciones,
        detalles: formData.detalles.map(detalle => ({
          productoId: detalle.productoId,
          unidadMedidaId: detalle.unidadMedidaId,
          cantidad: parseFloat(detalle.cantidad),
          costoUnitario: parseFloat(detalle.costoUnitario),
          impuesto: parseFloat(detalle.impuesto) || 0,
          descuento: parseFloat(detalle.descuento) || 0
        }))
      };

      return await procesarCompra(compraData);
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al guardar la compra');
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (compra) => {
    setFormData({
      numeroFactura: compra.numeroFactura || "",
      numeroControl: compra.numeroControl || "",
      proveedorId: compra.proveedorId || 0,  // Asegurar número
      sucursalId: compra.sucursalId || 0,    // Asegurar número
      fechaCompra: compra.fechaCompra ? new Date(compra.fechaCompra).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      observaciones: compra.observaciones || "",
      detalles: compra.detalles || []
    });
    setEditingId(compra.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      numeroFactura: "",
      numeroControl: "",
      proveedorId: 0,    // Cambiado a número
      sucursalId: 0,     // Cambiado a número
      fechaCompra: new Date().toISOString().split('T')[0],
      observaciones: "",
      detalles: []
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setShowForm(false);
    resetForm();
  };

  // Handlers para creación rápida
  const handleQuickProveedorInputChange = (e) => {
    const { name, value } = e.target;
    setQuickProveedorFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuickProductoInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuickProductoFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleQuickSucursalInputChange = (e) => {
    const { name, value } = e.target;
    setQuickSucursalFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateQuickProveedor = async (proveedorData) => {
  // REMOVER: e.preventDefault() - porque ahora recibe datos, no evento
  try {
    const nuevoProveedor = await servicioProveedores.crearProveedor(proveedorData);
    
    // Recargar proveedores inmediatamente
    await recargarProveedores();
    
    // Seleccionar automáticamente el nuevo proveedor
    setFormData(prev => ({
      ...prev,
      proveedorId: Number(nuevoProveedor.id)
    }));
    
    setSuccess("Proveedor creado correctamente");
    setShowQuickProveedorModal(false);
    
    // Resetear formulario (si es necesario)
    // setQuickProveedorFormData({ ... }); // Puedes eliminar esto si no lo usas
    
  } catch (err) {
    const errorMessage = handleApiError(err, "Error al crear el proveedor");
    setError(errorMessage);
    throw err; // Relanzar el error para que el formulario lo maneje
  }
};

  const handleCreateQuickProducto = async (productoData) => {
    try {
      // Preparar datos para enviar
      const datosEnviar = {
        ...productoData,
        categoriaId: productoData.categoriaId ? parseInt(productoData.categoriaId) : null,
        unidadMedidaId: productoData.unidadMedidaId ? parseInt(productoData.unidadMedidaId) : null,
        unidadCompraId: productoData.unidadCompraId ? parseInt(productoData.unidadCompraId) : null,
        factorConversion: productoData.factorConversion ? parseFloat(productoData.factorConversion) : null,
        margenDefault: productoData.margenDefault ? parseFloat(productoData.margenDefault) : 30,
        destacado: productoData.destacado || false,
        generarPreciosAutomaticos: productoData.generarPreciosAutomaticos !== false
      };

      const nuevoProducto = await servicioProductos.crearProducto(datosEnviar);
      
      // Recargar productos inmediatamente
      await recargarProductos();
      
      setSuccess("Producto creado correctamente");
      setShowQuickProductoModal(false);
      
      // Resetear formulario
      setQuickProductoFormData({
        nombreProducto: "",
        codigoBarras: "",
        descripcion: "",
        imagen: "",
        categoriaId: "",
        unidadMedidaId: "",
        unidadCompraId: "",
        factorConversion: "",
        margenDefault: "30",
        destacado: false,
        generarPreciosAutomaticos: true
      });
      
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al crear el producto");
      setError(errorMessage);
    }
  };

  const handleCreateQuickSucursal = async (e) => {
    e.preventDefault();
    try {
      const nuevaSucursal = await servicioSucursales.crearSucursal(quickSucursalFormData);
      
      // Recargar sucursales inmediatamente
      await recargarSucursales();
      
      // Seleccionar automáticamente la nueva sucursal (usar número)
      setFormData(prev => ({
        ...prev,
        sucursalId: Number(nuevaSucursal.id)
      }));
      
      setSuccess("Sucursal creada correctamente");
      setShowQuickSucursalModal(false);
      
      // Resetear formulario
      setQuickSucursalFormData({
        nombreSucursal: "",
        direccion: "",
        telefono: ""
      });
      
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al crear la sucursal");
      setError(errorMessage);
    }
  };

  // Funciones existentes para compras
  const eliminarCompra = async (id) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await comprasService.eliminarCompra(id);
      const successMessage = 'Compra eliminada correctamente';
      setSuccess(successMessage);
      await cargarDatos();
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al eliminar la compra');
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const recibirCompra = async (id) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await comprasService.recibirCompra(id);
      const successMessage = 'Compra recibida correctamente';
      setSuccess(successMessage);
      await cargarDatos();
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al recibir la compra');
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelarCompra = async (id) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await comprasService.cancelarCompra(id);
      const successMessage = 'Compra cancelada correctamente';
      setSuccess(successMessage);
      await cargarDatos();
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al cancelar la compra');
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const obtenerCompraDetalles = async (id) => {
    try {
      const compra = await comprasService.obtenerCompraPorId(id);
      return compra;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al cargar los detalles de la compra');
      setError(errorMessage);
      return null;
    }
  };

  const recibirCompraParcial = async (id, detallesRecepcion) => {
  setLoading(true);
  setError('');
  setSuccess('');
  
  try {
    await comprasService.recibirCompraParcial(id, detallesRecepcion);
    const successMessage = 'Compra recibida parcialmente correctamente';
    setSuccess(successMessage);
    await cargarDatos();
    return true;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Error al recibir parcialmente la compra');
    setError(errorMessage);
    return false;
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    cargarDatos();
  }, []);

  return {
    // Estados principales
    compras,
    loading,
    error,
    success,
    
    // Estados del formulario
    showForm,
    editingId,
    formData,
    
    // Estados de datos
    proveedores,
    sucursales,
    productos,
    unidadesMedida,
    categorias,
    
    // Estados de creación rápida
    showQuickProveedorModal,
    showQuickProductoModal,
    showQuickSucursalModal,
    quickProveedorFormData,
    quickProductoFormData,
    quickSucursalFormData,
    
    // Setters
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
    
    // Funciones principales
    cargarDatos,
    recargarCompras,
    handleInputChange,
    handleDetalleChange,
    agregarDetalle,
    eliminarDetalle,
    handleSubmit,
    handleEdit,
    resetForm,
    cancelEdit,
    
    // Funciones de recarga
    recargarProveedores,
    recargarProductos,
    recargarSucursales,
    
    // Funciones de creación rápida
    handleQuickProveedorInputChange,
    handleQuickProductoInputChange,
    handleQuickSucursalInputChange,
    handleCreateQuickProveedor,
    handleCreateQuickProducto,
    handleCreateQuickSucursal,
    
    // Funciones de compras
    eliminarCompra,
    recibirCompra,
    recibirCompraParcial,
    cancelarCompra,
    obtenerCompraDetalles
  };
};