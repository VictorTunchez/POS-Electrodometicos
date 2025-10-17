package pos.api.domain.usuario.rol;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IPermisoRepository extends JpaRepository<Permiso, Long> {
    Optional<Permiso> findByCodigo(String codigo);
}

