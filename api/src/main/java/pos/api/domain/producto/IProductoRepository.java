package pos.api.domain.producto;

import org.springframework.data.jpa.repository.JpaRepository;
import pos.api.domain.unidadMedida.UnidadMedida;

import java.util.List;
import java.util.Optional;

public interface IProductoRepository extends JpaRepository<Producto, Long> {
    Optional<Producto> findByIdAndDeletedAtIsNull(Long id);

    List<Producto> findByDeletedAtIsNull();

    boolean existsByCodigoBarrasAndDeletedAtIsNull(String codigoBarras);

    boolean existsByCodigoBarrasAndIdNotAndDeletedAtIsNull(String codigoBarras, Long id);

    boolean existsByNombreProductoAndDeletedAtIsNull(String nombreProducto);

    boolean existsByNombreProductoAndIdNotAndDeletedAtIsNull(String nombreProducto, Long id);

    List<Producto> findByCategoriaIdAndDeletedAtIsNull(Long categoriaId);

    List<Producto> findByDestacadoAndDeletedAtIsNull(Boolean destacado);

    List<Producto> findByUnidadMedidaAndDeletedAtIsNull(UnidadMedida unidadMedida);

    Long countByDeletedAtIsNull();

}
