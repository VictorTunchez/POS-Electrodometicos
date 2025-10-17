import { useState, useEffect } from 'react';
import proveedoresService from '../../../services/servicioProveedores';

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cargarDatos = async (viewMode = 'activos') => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (viewMode === 'activos') {
        data = await proveedoresService.obtenerProveedores();
      } else {
        data = await proveedoresService.obtenerTodosProveedores();
      }
      setProveedores(data);
    } catch (error) {
      setError('Error al cargar los proveedores');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const recargarProveedores = async () => {
    await cargarDatos();
  };

  const crearProveedor = async (proveedorData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await proveedoresService.crearProveedor(proveedorData);
      setSuccess('Proveedor creado correctamente');
      await cargarDatos('activos');
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Error al crear el proveedor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const actualizarProveedor = async (id, proveedorData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await proveedoresService.actualizarProveedor(id, proveedorData);
      setSuccess('Proveedor actualizado correctamente');
      await cargarDatos('activos');
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Error al actualizar el proveedor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const eliminarProveedor = async (id, viewMode = 'activos') => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await proveedoresService.eliminarProveedor(id);
      setSuccess('Proveedor eliminado correctamente');
      await cargarDatos(viewMode);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Error al eliminar el proveedor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const restaurarProveedor = async (id, viewMode = 'todos') => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await proveedoresService.restaurarProveedor(id);
      setSuccess('Proveedor restaurado correctamente');
      await cargarDatos(viewMode);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Error al restaurar el proveedor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const obtenerProveedorDetalles = async (id) => {
    try {
      const proveedor = await proveedoresService.obtenerProveedorPorId(id);
      return proveedor;
    } catch (error) {
      setError('Error al cargar los detalles del proveedor');
      return null;
    }
  };

  const obtenerComprasPorProveedor = async (proveedorId) => {
    try {
      const compras = await proveedoresService.obtenerComprasPorProveedor(proveedorId);
      return compras;
    } catch (error) {
      console.error('Error al cargar las compras del proveedor:', error);
      return [];
    }
  };

  // Función para buscar proveedores
  const buscarProveedores = async (razonSocial, ruc) => {
    setLoading(true);
    setError('');
    try {
      const data = await proveedoresService.buscarProveedores(razonSocial, ruc);
      setProveedores(data);
    } catch (error) {
      setError('Error al buscar proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos('activos');
  }, []);

  return {
    proveedores,
    loading,
    error,
    success,
    setError,
    setSuccess,
    cargarDatos,
    recargarProveedores,
    crearProveedor,
    actualizarProveedor,
    eliminarProveedor,
    restaurarProveedor,
    obtenerProveedorDetalles,
    obtenerComprasPorProveedor,
    buscarProveedores
  };
};