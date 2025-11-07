package pos.api.domain.listaPrecios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IPrecioProductoRepository extends JpaRepository<PrecioProducto, Long> {
    // Buscar precios activos de un producto
    List<PrecioProducto> findByProductoIdAndActivoTrue(Long productoId);

    // Buscar precio específico por producto, unidad y tipo
    Optional<PrecioProducto> findByProductoIdAndUnidadMedidaIdAndTipoPrecioAndActivoTrue(
            Long productoId, Long unidadMedidaId, TipoPrecio tipoPrecio);

    // Buscar precios por producto y tipo
    Optional<PrecioProducto> findByProductoIdAndTipoPrecioAndActivoTrue(Long productoId, TipoPrecio tipoPrecio);

    // Buscar precio por producto y unidad
    List<PrecioProducto> findByProductoIdAndUnidadMedidaIdAndActivoTrue(Long productoId, Long unidadMedidaId);

    // Verificar si existe precio con misma combinación
    boolean existsByProductoIdAndUnidadMedidaIdAndTipoPrecioAndActivoTrue(
            Long productoId, Long unidadMedidaId, TipoPrecio tipoPrecio);

    @Modifying
    @Query("UPDATE PrecioProducto p SET p.activo = false WHERE p.producto.id = :productoId")
    void desactivarPreciosAnteriores(@Param("productoId") Long productoId);

    Optional<PrecioProducto> findByProductoIdAndUnidadMedidaIdAndTipoPrecio(
            Long productoId, Long unidadMedidaId, TipoPrecio tipoPrecio);


}
