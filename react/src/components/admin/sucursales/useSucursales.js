import { useState, useEffect } from "react";
import servicioSucursales from "../../../services/servicioSucursales";
import { handleApiError } from "../../../utils/errorHandler";

export const useSucursales = () => {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("activos");
  const [formData, setFormData] = useState({
    nombreSucursal: "",
    direccion: "",
    telefono: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState(null);

  useEffect(() => {
    cargarSucursales();
  }, [viewMode]);

  const cargarSucursales = async () => {
    try {
      setLoading(true);
      const datos = viewMode === "todos"
        ? await servicioSucursales.obtenerTodasSucursales()
        : await servicioSucursales.obtenerSucursales();
      setSucursales(datos);
      setError("");
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al cargar las sucursales");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await servicioSucursales.actualizarSucursal(editingId, formData);
        setSuccess("Sucursal actualizada correctamente");
      } else {
        await servicioSucursales.crearSucursal(formData);
        setSuccess("Sucursal creada correctamente");
      }
      setShowForm(false);
      resetForm();
      cargarSucursales();
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al guardar la sucursal");
      setError(errorMessage);
    }
  };

  const handleEdit = (sucursal) => {
    setFormData({
      nombreSucursal: sucursal.nombreSucursal,
      direccion: sucursal.direccion,
      telefono: sucursal.telefono
    });
    setEditingId(sucursal.id);
    setShowForm(true);
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewDetails = async (id) => {
    try {
      const sucursal = await servicioSucursales.obtenerSucursalPorId(id);
      setSelectedSucursal(sucursal);
      setShowDetailsModal(true);
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al obtener detalles");
      setError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta sucursal?")) {
      try {
        await servicioSucursales.eliminarSucursal(id);
        setSuccess("Sucursal eliminada correctamente");
        cargarSucursales();
      } catch (err) {
        const errorMessage = handleApiError(err, "Error al eliminar la sucursal");
        setError(errorMessage);
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await servicioSucursales.restaurarSucursal(id);
      setSuccess("Sucursal restaurada correctamente");
      cargarSucursales();
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al restaurar la sucursal");
      setError(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      nombreSucursal: "",
      direccion: "",
      telefono: ""
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setShowForm(false);
    resetForm();
  };

  return {
    sucursales,
    loading,
    error,
    success,
    showForm,
    editingId,
    formData,
    viewMode,
    searchTerm,
    showDetailsModal,
    selectedSucursal,
    setError,
    setSuccess,
    setShowForm,
    setEditingId,
    setFormData,
    setViewMode,
    setSearchTerm,
    setShowDetailsModal,
    setSelectedSucursal,
    cargarSucursales,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleViewDetails,
    handleDelete,
    handleRestore,
    resetForm,
    cancelEdit
  };
};