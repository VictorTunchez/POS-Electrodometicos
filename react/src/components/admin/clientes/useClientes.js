import { useState, useEffect } from 'react';
import clientesService from '../../../services/servicioClientes';
import { handleApiError } from '../../../utils/errorHandler';

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await clientesService.obtenerClientes();
      setClientes(data);
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al cargar los clientes');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const recargarClientes = async () => {
    await cargarDatos();
  };

  const crearCliente = async (clienteData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await clientesService.crearCliente(clienteData);
      const successMessage = 'Cliente creado correctamente';
      setSuccess(successMessage);
      await cargarDatos();
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al crear el cliente');
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const actualizarCliente = async (id, clienteData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await clientesService.actualizarCliente(id, clienteData);
      const successMessage = 'Cliente actualizado correctamente';
      setSuccess(successMessage);
      await cargarDatos();
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al actualizar el cliente');
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const eliminarCliente = async (id) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await clientesService.eliminarCliente(id);
      const successMessage = 'Cliente eliminado correctamente';
      setSuccess(successMessage);
      await cargarDatos();
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al eliminar el cliente');
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const buscarClientePorDocumento = async (numeroDocumento) => {
    try {
      const cliente = await clientesService.buscarClientePorDocumento(numeroDocumento);
      return cliente;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al buscar el cliente');
      setError(errorMessage);
      return null;
    }
  };

  const obtenerClienteDetalles = async (id) => {
    try {
      const cliente = await clientesService.obtenerClientePorId(id);
      return cliente;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Error al cargar los detalles del cliente');
      setError(errorMessage);
      return null;
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return {
    clientes,
    loading,
    error,
    success,
    setError,
    setSuccess,
    cargarDatos,
    recargarClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    buscarClientePorDocumento,
    obtenerClienteDetalles
  };
};