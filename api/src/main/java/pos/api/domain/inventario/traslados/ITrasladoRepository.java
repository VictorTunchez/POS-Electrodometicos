package pos.api.domain.inventario.traslados;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

public interface ITrasladoRepository extends JpaRepository<Traslado, Long> {
    List<Traslado> findBySucursalOrigenId(Long sucursalOrigenId);
    List<Traslado> findBySucursalDestinoId(Long sucursalDestinoId);
    List<Traslado> findByEstado(EstadoTraslado estado);
    List<Traslado> findByUsuarioId(Long usuarioId);

    List<Traslado> findBySucursalOrigenIdAndEstado(Long sucursalId, EstadoTraslado estado);

    Collection<? extends Traslado> findBySucursalDestinoIdAndEstado(Long sucursalId, EstadoTraslado estado);

    Arrays findByCreatedAtAfter(LocalDateTime fechaLimite);
}
