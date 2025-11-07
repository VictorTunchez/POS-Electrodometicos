import { useState, useEffect } from "react";
import servicioUsuarios from "../../../services/servicioUsuarios";
import servicioRoles from "../../../services/servicioRoles";
import { handleApiError } from "../../../utils/errorHandler";

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("activos");
  const [formData, setFormData] = useState({
    email: "",
    nombre: "",
    apellido: "",
    contrasena: "",
    rolId: "",
    sucursalId: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  
  // Estados para creación rápida de roles
  const [showQuickRolModal, setShowQuickRolModal] = useState(false);
  const [quickRolFormData, setQuickRolFormData] = useState({
    nombreRol: "",
    descripcion: ""
  });
  const [selectedPermisos, setSelectedPermisos] = useState(new Set());

  useEffect(() => {
    cargarDatos();
  }, [viewMode]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [usuariosData, rolesData, sucursalesData, permisosData] = await Promise.all([
        viewMode === "todos" ? servicioUsuarios.obtenerTodosUsuarios() : servicioUsuarios.obtenerUsuarios(),
        servicioUsuarios.obtenerRoles(),
        servicioUsuarios.obtenerSucursales(),
        servicioRoles.obtenerPermisos() // Necesitamos permisos para el formulario de roles
      ]);
      setUsuarios(usuariosData);
      setRoles(rolesData);
      setSucursales(sucursalesData);
      setPermisos(permisosData);
      setError("");
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al cargar los datos");
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
        await servicioUsuarios.actualizarUsuario(editingId, formData);
        setSuccess("Usuario actualizado correctamente");
      } else {
        await servicioUsuarios.crearUsuario(formData);
        setSuccess("Usuario creado correctamente");
      }
      setShowForm(false);
      resetForm();
      cargarDatos();
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al guardar el usuario");
      setError(errorMessage);
    }
  };

  const handleEdit = (usuario) => {
    setFormData({
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      contrasena: "", // No cargar contraseña por seguridad
      rolId: usuario.rolId,
      sucursalId: usuario.sucursalId || ""
    });
    setEditingId(usuario.id);
    setShowForm(true);
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewDetails = async (id) => {
    try {
      const usuario = await servicioUsuarios.obtenerUsuarioPorId(id);
      setSelectedUsuario(usuario);
      setShowDetailsModal(true);
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al obtener detalles");
      setError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await servicioUsuarios.eliminarUsuario(id);
        setSuccess("Usuario eliminado correctamente");
        cargarDatos();
      } catch (err) {
        const errorMessage = handleApiError(err, "Error al eliminar el usuario");
        setError(errorMessage);
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await servicioUsuarios.restaurarUsuario(id);
      setSuccess("Usuario restaurado correctamente");
      cargarDatos();
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al restaurar el usuario");
      setError(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      nombre: "",
      apellido: "",
      contrasena: "",
      rolId: "",
      sucursalId: ""
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setShowForm(false);
    resetForm();
  };

  // Funciones para creación rápida de roles
  const handleQuickRolInputChange = (e) => {
    const { name, value } = e.target;
    setQuickRolFormData({
      ...quickRolFormData,
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

  const handleCreateQuickRol = async (e) => {
    e.preventDefault();
    try {
      // Validar que se hayan seleccionado permisos
      if (selectedPermisos.size === 0) {
        setError("Debe seleccionar al menos un permiso para el rol");
        return;
      }

      const datosEnvio = {
        ...quickRolFormData,
        permisoIds: Array.from(selectedPermisos)
      };

      const nuevoRol = await servicioRoles.crearRol(datosEnvio);
      
      // Actualizar la lista de roles
      const rolesActualizados = await servicioUsuarios.obtenerRoles();
      setRoles(rolesActualizados);
      
      // Seleccionar automáticamente el nuevo rol en el formulario de usuario
      setFormData(prev => ({
        ...prev,
        rolId: nuevoRol.id
      }));
      
      setSuccess("Rol creado correctamente y seleccionado");
      setShowQuickRolModal(false);
      
      // Resetear el formulario de rol
      setQuickRolFormData({
        nombreRol: "",
        descripcion: ""
      });
      setSelectedPermisos(new Set());
      
    } catch (err) {
      const errorMessage = handleApiError(err, "Error al crear el rol");
      setError(errorMessage);
    }
  };

  // Agrupar permisos por categoría (igual que en el componente Roles)
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
    usuarios,
    roles,
    sucursales,
    permisos,
    loading,
    error,
    success,
    showForm,
    editingId,
    formData,
    viewMode,
    searchTerm,
    showDetailsModal,
    selectedUsuario,
    showQuickRolModal,
    quickRolFormData,
    selectedPermisos,
    setError,
    setSuccess,
    setShowForm,
    setEditingId,
    setFormData,
    setViewMode,
    setSearchTerm,
    setShowDetailsModal,
    setSelectedUsuario,
    setShowQuickRolModal,
    setQuickRolFormData,
    setSelectedPermisos,
    cargarDatos,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleViewDetails,
    handleDelete,
    handleRestore,
    resetForm,
    cancelEdit,
    handleCreateQuickRol,
    handleQuickRolInputChange,
    handlePermisoChange,
    handleCategoriaChange,
    groupedPermisos,
    isCategoriaCompleta,
    isCategoriaParcial
  };
};