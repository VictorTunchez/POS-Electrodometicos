package pos.api.domain.venta;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface IVentaRepository extends JpaRepository<Venta, Long> {

    // Buscar venta por número de factura
    Optional<Venta> findByNumeroFactura(String numeroFactura);

    // Listar ventas por sucursal
    List<Venta> findBySucursalId(Long sucursalId);

    // Listar ventas por cliente
    List<Venta> findByClienteId(Long clienteId);

    // Listar ventas por estado
    List<Venta> findByEstado(EstadoVenta estado);

    // Listar ventas por rango de fechas
    List<Venta> findByFechaVentaBetween(Instant fechaInicio, Instant fechaFin);

    // Listar ventas por usuario (vendedor)
    List<Venta> findByUsuarioId(Long usuarioId);

    // Buscar venta por sesión de Stripe
    Optional<Venta> findByStripeSessionId(String stripeSessionId);


    // PostgreSQL: usar CURRENT_DATE en lugar de CURDATE()
    @Query(value = "SELECT COALESCE(SUM(total), 0) FROM ventas WHERE DATE(fecha_venta) = CURRENT_DATE", nativeQuery = true)
    BigDecimal findTotalVentasHoy();

    @Query(value = "SELECT COUNT(*) FROM ventas WHERE DATE(fecha_venta) = CURRENT_DATE", nativeQuery = true)
    Long countVentasHoy();

    // PostgreSQL: usar EXTRACT en lugar de YEAR/MONTH functions
    @Query(value = "SELECT COALESCE(SUM(total), 0) FROM ventas WHERE EXTRACT(YEAR FROM fecha_venta) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(MONTH FROM fecha_venta) = EXTRACT(MONTH FROM CURRENT_DATE)", nativeQuery = true)
    BigDecimal findTotalVentasEsteMes();

    // PostgreSQL: mes anterior usando INTERVAL
    @Query(value = "SELECT COALESCE(SUM(total), 0) FROM ventas WHERE EXTRACT(YEAR FROM fecha_venta) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month') AND EXTRACT(MONTH FROM fecha_venta) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')", nativeQuery = true)
    BigDecimal findTotalVentasMesAnterior();

    // PostgreSQL: productos populares
    @Query(value = "SELECT p.nombre_producto, SUM(dv.cantidad) as total_vendido, SUM(dv.total) as total_ganancia " +
            "FROM detalle_venta dv " +
            "JOIN productos p ON dv.producto_id = p.id " +
            "JOIN ventas v ON dv.venta_id = v.id " +
            "WHERE EXTRACT(YEAR FROM v.fecha_venta) = EXTRACT(YEAR FROM CURRENT_DATE) " +
            "GROUP BY p.id, p.nombre_producto " +
            "ORDER BY total_vendido DESC " +
            "LIMIT 5", nativeQuery = true)
    List<Object[]> findProductosPopulares();

    @Query(value = "SELECT s.nombre_sucursal, COALESCE(SUM(v.total), 0) as ventas, " +
            "ROUND((COALESCE(SUM(v.total), 0) / (SELECT COALESCE(SUM(total), 1) FROM ventas WHERE DATE(fecha_venta) >= DATE_TRUNC('month', CURRENT_DATE))) * 100, 2) as porcentaje " +
            "FROM sucursales s " +
            "LEFT JOIN ventas v ON s.id = v.sucursal_id AND DATE(v.fecha_venta) >= DATE_TRUNC('month', CURRENT_DATE) " +
            "WHERE s.deleted_at IS NULL " +
            "GROUP BY s.id, s.nombre_sucursal " +
            "ORDER BY ventas DESC", nativeQuery = true)
    List<Object[]> findVentasPorSucursal();


}
