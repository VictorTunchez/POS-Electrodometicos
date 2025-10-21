package pos.api.domain.inventario.ajustes;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface IAjusteInventarioRepository extends JpaRepository<AjusteInventario, Long> {
    List<AjusteInventario> findBySucursalId(Long sucursalId);
    List<AjusteInventario> findByProductoId(Long productoId);
    List<AjusteInventario> findBySucursalIdAndFechaAjusteBetween(Long sucursalId, Instant desde, Instant hasta);
}
