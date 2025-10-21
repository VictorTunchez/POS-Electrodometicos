package pos.api.domain.inventario.movimientos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface IMovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {
    List<MovimientoInventario> findByProductoIdAndSucursalIdOrderByFechaMovimientoDesc(Long productoId, Long sucursalId);
    List<MovimientoInventario> findBySucursalIdAndFechaMovimientoBetween(Long sucursalId, Instant desde, Instant hasta);
    List<MovimientoInventario> findByProductoIdOrderByFechaMovimientoDesc(Long productoId);

    @Query("SELECT COUNT(m) > 0 FROM MovimientoInventario m WHERE m.producto.id = :productoId AND m.sucursal.id = :sucursalId AND m.referenciaTipo = :referenciaTipo AND m.referenciaId = :referenciaId")
    boolean existsByProductoIdAndSucursalIdAndReferenciaTipoAndReferenciaId(
            @Param("productoId") Long productoId,
            @Param("sucursalId") Long sucursalId,
            @Param("referenciaTipo") String referenciaTipo,
            @Param("referenciaId") Long referenciaId);

    @Query("SELECT COUNT(m) > 0 FROM MovimientoInventario m " +
            "WHERE m.referenciaTipo = :referenciaTipo AND m.referenciaId = :referenciaId")
    boolean existeMovimiento(@Param("referenciaTipo") String referenciaTipo,
                             @Param("referenciaId") Long referenciaId);

}
