package pos.api.domain.proveedor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public interface IProveedorRepository extends JpaRepository<Proveedor, Long> {
    boolean existsByNitAndDeletedAtIsNull(String nit);
    boolean existsByNitAndIdNotAndDeletedAtIsNull(String nit, Long id);
    List<Proveedor> findByRazonSocialContainingIgnoreCaseAndNitAndDeletedAtIsNull(String razonSocial, String nit);
    List<Proveedor> findByNitAndDeletedAtIsNull(String nit);
    List<Proveedor> findByDeletedAtIsNull();
    List<Proveedor> findByDeletedAtIsNotNull();
    Optional<Proveedor> findByIdAndDeletedAtIsNull(Long id);
    List<Proveedor> findByRazonSocialContainingIgnoreCaseAndDeletedAtIsNull(String razonSocial);
    boolean existsByIdAndDeletedAtIsNull(Long id);
}
