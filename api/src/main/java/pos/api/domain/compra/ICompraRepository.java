package pos.api.domain.compra;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ICompraRepository extends JpaRepository<Compra, Long> {
    List<Compra> findBySucursalId(Long sucursalId);
    List<Compra> findByProveedorId(Long proveedorId);
    List<Compra> findByEstado(EstadoCompra estado);
    Optional<Compra> findByNumeroFactura(String numeroFactura);
    List<Compra> findByFechaCompraBetween(Instant fechaInicio, Instant fechaFin);

    @Query(value = "SELECT COALESCE(SUM(total), 0) FROM compras WHERE EXTRACT(YEAR FROM fecha_compra) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(MONTH FROM fecha_compra) = EXTRACT(MONTH FROM CURRENT_DATE)", nativeQuery = true)
    BigDecimal findTotalComprasEsteMes();

    Compra findFirstByOrderByFechaCompraDesc();
}
