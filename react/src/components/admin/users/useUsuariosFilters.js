import { useMemo } from "react";

export const useUsuariosFilters = (usuarios, searchTerm) => {
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(usuario =>
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [usuarios, searchTerm]);

  return { filteredUsuarios };
};