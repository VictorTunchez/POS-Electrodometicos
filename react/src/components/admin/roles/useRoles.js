import { useState, useEffect } from "react";
import servicioRoles from "../../../services/servicioRoles";
import { handleApiError } from "../../../utils/errorHandler";

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPermisos, setSelectedPermisos] = useState(new Set());
  const [viewMode, setViewMode] = useState("activos");
  const [formData, setFormData] = useState({
    nombreRol: "",
    descripcion: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [errorDetails, setErrorDetails] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRol, setSelectedRol] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [viewMode]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [rolesData, permisosData] = await Promise.all([
        viewMode === "todos" ? servicioRoles.obtenerTodosRoles() : servicioRoles.obtenerRoles(),
        servicioRoles.obtenerPermisos()
      ]);
      setRoles(rolesData);
      setPermisos(permisosData);
      setError("");
      setErrorDetails([]);
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al cargar los datos");
      setError(errorMessage);

      if (err.response?.data?.detalles) {
        setErrorDetails(Object.values(err.response.data.detalles));
      } else {
        setErrorDetails([]);
      }
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

  const handlePermisoChange = (permisoId, isChecked) => {
    const nuevosPermisos = new Set(selectedPermisos);
    if (isChecked) {
      nuevosPermisos.add(permisoId);
    } else {
      nuevosPermisos.delete(permisoId);
    }
    setSelectedPermisos(nuevosPermisos);
  };

  const handleCategoriaChange = (categoria, isChecked) => {
    const nuevosPermisos = new Set(selectedPermisos);
    const permisosCategoria = permisos.filter(p => p.categoria === categoria);

    if (isChecked) {
      permisosCategoria.forEach(permiso => nuevosPermisos.add(permiso.id));
    } else {
      permisosCategoria.forEach(permiso => nuevosPermisos.delete(permiso.id));
    }
    setSelectedPermisos(nuevosPermisos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const datosEnvio = {
        ...formData,
        permisoIds: Array.from(selectedPermisos)
      };

      if (editingId) {
        await servicioRoles.actualizarRol(editingId, datosEnvio);
        setSuccess("Rol actualizado correctamente");
      } else {
        await servicioRoles.crearRol(datosEnvio);
        setSuccess("Rol creado correctamente");
      }

      setShowForm(false);
      resetForm();
      cargarDatos();
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al guardar el rol");
      setError(errorMessage);

      if (err.response?.data?.detalles) {
        setErrorDetails(Object.values(err.response.data.detalles));
      } else {
        setErrorDetails([]);
      }
    }
  };

  const handleEdit = (rol) => {
    setFormData({
      nombreRol: rol.nombreRol,
      descripcion: rol.descripcion
    });
    setEditingId(rol.id);
    setSelectedPermisos(new Set(rol.permisos.map(p => p.id)));
    setShowForm(true);
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewDetails = async (id) => {
    try {
      const rol = await servicioRoles.obtenerRolPorId(id);
      setSelectedRol(rol);
      setShowDetailsModal(true);
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al obtener detalles");
      setError(errorMessage);
      setErrorDetails([]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este rol?")) {
      try {
        await servicioRoles.eliminarRol(id);
        setSuccess("Rol eliminado correctamente");
        cargarDatos();
      } catch (err) {
        const errorMessage = handleApiError(err, "Error al eliminar el rol");
        setError(errorMessage);
        setErrorDetails([]);
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await servicioRoles.restaurarRol(id);
      setSuccess("Rol restaurado correctamente");
      cargarDatos();
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al restaurar el rol");
      setError(errorMessage);
      setErrorDetails([]);
    }
  };

  const resetForm = () => {
    setFormData({ nombreRol: "", descripcion: "" });
    setSelectedPermisos(new Set());
    setEditingId(null);
    setErrorDetails([]);
  };

  const cancelEdit = () => {
    setShowForm(false);
    resetForm();
  };

  const groupedPermisos = permisos.reduce((acc, permiso) => {
    if (!acc[permiso.categoria]) {
      acc[permiso.categoria] = [];
    }
    acc[permiso.categoria].push(permiso);
    return acc;
  }, {});

  const isCategoriaCompleta = (categoria) => {
    const permisosCategoria = permisos.filter(p => p.categoria === categoria);
    return permisosCategoria.every(p => selectedPermisos.has(p.id));
  };

  const isCategoriaParcial = (categoria) => {
    const permisosCategoria = permisos.filter(p => p.categoria === categoria);
    const seleccionados = permisosCategoria.filter(p => selectedPermisos.has(p.id));
    return seleccionados.length > 0 && seleccionados.length < permisosCategoria.length;
  };

  return {
    roles,
    permisos,
    loading,
    error,
    success,
    errorDetails,
    showForm,
    editingId,
    formData,
    selectedPermisos,
    viewMode,
    searchTerm,
    showDetailsModal,
    selectedRol,
    setError,
    setSuccess,
    setShowForm,
    setEditingId,
    setFormData,
    setSelectedPermisos,
    setViewMode,
    setSearchTerm,
    setShowDetailsModal,
    setSelectedRol,
    cargarDatos,
    handleInputChange,
    handlePermisoChange,
    handleCategoriaChange,
    handleSubmit,
    handleEdit,
    handleViewDetails,
    handleDelete,
    handleRestore,
    resetForm,
    cancelEdit,
    groupedPermisos,
    isCategoriaCompleta,
    isCategoriaParcial
  };
};