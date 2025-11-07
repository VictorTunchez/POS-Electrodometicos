import { useMemo } from 'react';

export const useComprasFilters = () => {
  const filtrarCompras = (compras, filters) => {
    return compras.filter(compra => {
      // Filtro por término de búsqueda
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        if (filters.searchType === 'numeroFactura') {
          if (!compra.numeroFactura?.toLowerCase().includes(term)) {
            return false;
          }
        } else if (filters.searchType === 'proveedor') {
          if (!compra.proveedorRazonSocial?.toLowerCase().includes(term)) {
            return false;
          }
        } else if (filters.searchType === 'sucursal') {
          if (!compra.sucursalNombre?.toLowerCase().includes(term)) {
            return false;
          }
        }
      }

      // Filtro por estado
      if (filters.estado !== "TODOS" && compra.estado !== filters.estado) {
        return false;
      }

      // Filtro por rango de fechas
      if (filters.fechaInicio) {
        const fechaCompra = new Date(compra.fechaCompra);
        const fechaInicio = new Date(filters.fechaInicio);
        if (fechaCompra < fechaInicio) {
          return false;
        }
      }

      if (filters.fechaFin) {
        const fechaCompra = new Date(compra.fechaCompra);
        const fechaFin = new Date(filters.fechaFin);
        if (fechaCompra > fechaFin) {
          return false;
        }
      }

      return true;
    });
  };

  return {
    filtrarCompras
  };
};