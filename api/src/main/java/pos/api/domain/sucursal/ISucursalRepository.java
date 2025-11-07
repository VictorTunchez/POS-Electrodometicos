package pos.api.domain.sucursal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ISucursalRepository extends JpaRepository<Sucursal, Long> {
    Optional<Sucursal> findByNombreSucursal(String nombreSucursal);
    Optional<Sucursal> findByIdAndDeletedAtIsNull(Long id);
    List<Sucursal> findByDeletedAtIsNull();

    Long countByDeletedAtIsNull();

//    @Query(value = "SELECT s FROM Sucursal s WHERE s.deletedAt IS NULL ORDER BY s.nombreSucursal")
//    List<Sucursal> findSucursalesActivasConVentas();
}
