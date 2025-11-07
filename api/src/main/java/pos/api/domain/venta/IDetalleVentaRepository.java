package pos.api.domain.venta;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IDetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {

    // Buscar detalles por venta
    List<DetalleVenta> findByVentaId(Long ventaId);

    // Buscar detalles por producto
    List<DetalleVenta> findByProductoId(Long productoId);
}
