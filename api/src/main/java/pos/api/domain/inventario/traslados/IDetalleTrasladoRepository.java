package pos.api.domain.inventario.traslados;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IDetalleTrasladoRepository extends JpaRepository<DetalleTraslado, Long> {
    List<DetalleTraslado> findByTrasladoId(Long trasladoId);
}
