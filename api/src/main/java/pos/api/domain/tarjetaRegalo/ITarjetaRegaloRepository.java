package pos.api.domain.tarjetaRegalo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ITarjetaRegaloRepository extends JpaRepository<TarjetaRegalo, Long> {
    boolean existsByCodigoAndDeletedAtIsNull(String codigo);

    boolean existsByCodigoAndIdNotAndDeletedAtIsNull(String codigo, Long id);

    List<TarjetaRegalo> findByDeletedAtIsNull();

    Optional<TarjetaRegalo> findByIdAndDeletedAtIsNull(Long id);
}
