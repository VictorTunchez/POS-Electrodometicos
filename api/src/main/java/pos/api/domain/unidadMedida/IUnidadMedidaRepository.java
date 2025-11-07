package pos.api.domain.unidadMedida;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IUnidadMedidaRepository extends JpaRepository<UnidadMedida, Long> {
    // Buscar unidades activas
    List<UnidadMedida> findByActivoTrue();

    // Buscar por tipo
    List<UnidadMedida> findByTipoAndActivoTrue(TipoUnidad tipo);

    // Verificar existencia por nombre
    boolean existsByNombre(String nombre);
    boolean existsByNombreAndIdNot(String nombre, Long id);

    // Verificar existencia por abreviatura
    boolean existsByAbreviatura(String abreviatura);
    boolean existsByAbreviaturaAndIdNot(String abreviatura, Long id);
}
