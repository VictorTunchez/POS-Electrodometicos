import { useMemo } from 'react';

export const useProveedoresFilters = () => {
  const filtrarProveedores = (proveedores, filters) => {
    return proveedores.filter(proveedor => {
      // Filtro por término de búsqueda
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        if (filters.searchType === 'razonSocial') {
          if (!proveedor.razonSocial?.toLowerCase().includes(term)) {
            return false;
          }
        } else if (filters.searchType === 'nit') {
          if (!proveedor.nit?.includes(term)) {
            return false;
          }
        }
      }
      return true;
    });
  };

  return {
    filtrarProveedores
  };
};