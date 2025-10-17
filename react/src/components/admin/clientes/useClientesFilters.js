import { useMemo } from 'react';

export const useClientesFilters = () => {
  const filtrarClientes = (clientes, filters) => {
    return clientes.filter(cliente => {
      // Filtro por término de búsqueda
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        if (filters.searchType === 'nombre') {
          if (!cliente.nombre?.toLowerCase().includes(term)) {
            return false;
          }
        } else if (filters.searchType === 'documento') {
          if (!cliente.numeroDocumento?.toLowerCase().includes(term)) {
            return false;
          }
        } else if (filters.searchType === 'email') {
          if (!cliente.email?.toLowerCase().includes(term)) {
            return false;
          }
        }
      }

      // Filtro por tipo de documento
      if (filters.tipoDocumento !== "TODOS" && cliente.tipoDocumento !== filters.tipoDocumento) {
        return false;
      }

      return true;
    });
  };

  return {
    filtrarClientes
  };
};