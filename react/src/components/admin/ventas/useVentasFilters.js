import { useMemo } from 'react';

export const useVentasFilters = () => {
  const filtrarVentas = (ventas, filters) => {
    return ventas.filter(venta => {
      // Filtro por término de búsqueda
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        if (filters.searchType === 'numeroFactura') {
          if (!venta.numeroFactura?.toLowerCase().includes(term)) {
            return false;
          }
        } else if (filters.searchType === 'cliente') {
          if (!venta.clienteNombre?.toLowerCase().includes(term)) {
            return false;
          }
        } else if (filters.searchType === 'sucursal') {
          if (!venta.sucursalNombre?.toLowerCase().includes(term)) {
            return false;
          }
        }
      }

      // Filtro por estado
      if (filters.estado !== "TODOS" && venta.estado !== filters.estado) {
        return false;
      }

      // Filtro por forma de pago
      if (filters.formaPago !== "TODOS" && venta.formaPago !== filters.formaPago) {
        return false;
      }

      // Filtro por tipo de venta
      if (filters.tipoVenta !== "TODOS" && venta.tipoVenta !== filters.tipoVenta) {
        return false;
      }

      // Filtro por rango de fechas
      if (filters.fechaInicio) {
        const fechaVenta = new Date(venta.fechaVenta);
        const fechaInicio = new Date(filters.fechaInicio);
        if (fechaVenta < fechaInicio) {
          return false;
        }
      }

      if (filters.fechaFin) {
        const fechaVenta = new Date(venta.fechaVenta);
        const fechaFin = new Date(filters.fechaFin);
        if (fechaVenta > fechaFin) {
          return false;
        }
      }

      return true;
    });
  };

  return {
    filtrarVentas
  };
};