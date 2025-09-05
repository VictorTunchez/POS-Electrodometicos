package pos.api.domain.user.rol;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IRolRepository extends JpaRepository<Rol, Long> {
    List<Rol> findByDeletedAtIsNull();
    Optional<Rol> findByIdAndDeletedAtIsNull(Long id);
    Optional<Rol> findByNombreRol(String nombreRol);
}
