package pos.api.domain.compra;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IDetalleCompraRepository extends JpaRepository<DetalleCompra, Long> {
    List<DetalleCompra> findByCompraId(Long compraId);
    List<DetalleCompra> findByProductoId(Long productoId);
}
