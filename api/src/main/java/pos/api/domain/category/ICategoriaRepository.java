package pos.api.domain.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ICategoriaRepository extends JpaRepository<Categoria, Long> {
    Optional<Categoria> findByIdAndDeletedAtIsNull(Long id);

    List<Categoria> findByDeletedAtIsNull();

    boolean existsByNombreCategoriaAndDeletedAtIsNull(String nombreCategoria);

    boolean existsByNombreCategoriaAndIdNotAndDeletedAtIsNull(String nombreCategoria, Long id);

    @Query("SELECT COUNT(p) FROM Producto p WHERE p.categoria.id = :categoriaId AND p.deletedAt IS NULL")
    Integer countProductosActivosByCategoriaId(Long categoriaId);
}
