import { useMemo } from "react";

export const useRolesFilters = (roles, searchTerm) => {
  const filteredRoles = useMemo(() => {
    return roles.filter(rol =>
      rol.nombreRol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  return { filteredRoles };
};