package pos.api.domain.inventario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface IInventarioRepository extends JpaRepository<Inventario, Long> {

    boolean existsByProductoIdAndSucursalId(Long productoId, Long sucursalId);

    Optional<Inventario> findByProductoIdAndSucursalId(Long productoId, Long sucursalId);

    List<Inventario> findBySucursalId(Long sucursalId);

    @Query("SELECT i FROM Inventario i WHERE i.stockActual <= i.stockMinimo")
    List<Inventario> findByStockActualLessThanEqualStockMinimo();

    List<Inventario> findByProductoId(Long id);

    // Consulta nativa para productos con stock bajo
    @Query(value = "SELECT COUNT(*) FROM inventario WHERE stock_actual <= stock_minimo", nativeQuery = true)
    Long countByStockActualLessThanEqualStockMinimo();
}