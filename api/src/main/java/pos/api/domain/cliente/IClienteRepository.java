package pos.api.domain.cliente;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface IClienteRepository extends JpaRepository<Cliente, Long> {

    // Buscar cliente por número de documento (excluyendo eliminados)
    Optional<Cliente> findByNumeroDocumentoAndDeletedAtIsNull(String numeroDocumento);

    // Listar clientes activos (no eliminados)
    List<Cliente> findByDeletedAtIsNull();

    // Verificar existencia por número de documento (activo)
    boolean existsByNumeroDocumentoAndDeletedAtIsNull(String numeroDocumento);

    // Buscar por ID y que no esté eliminado
    Optional<Cliente> findByIdAndDeletedAtIsNull(Long id);

    Long countByDeletedAtIsNull();

    @Query(value = "SELECT COUNT(*) FROM clientes WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) AND deleted_at IS NULL", nativeQuery = true)
    Long countClientesNuevosEsteMes();
}