package pos.api.domain.sucursal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ISucursalRepository extends JpaRepository<Sucursal, Long> {
    Optional<Sucursal> findByNombreSucursal(String nombreSucursal);
    Optional<Sucursal> findByIdAndDeletedAtIsNull(Long id);
    List<Sucursal> findByDeletedAtIsNull();
}
