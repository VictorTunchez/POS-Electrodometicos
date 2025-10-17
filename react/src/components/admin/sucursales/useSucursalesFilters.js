import { useMemo } from "react";

export const useSucursalesFilters = (sucursales, searchTerm) => {
  const filteredSucursales = useMemo(() => {
    return sucursales.filter(sucursal =>
      sucursal.nombreSucursal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sucursal.direccion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sucursales, searchTerm]);

  return { filteredSucursales };
};