package pos.api.domain.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IUsuarioRepository extends JpaRepository<Usuario, Long> {
    Usuario findByResetContrasenaToken(String token);

    Usuario findByEmail(String email);

    Optional<Usuario> findByIdAndDeletedAtIsNull(Long id);

    List<Usuario> findByDeletedAtIsNull();

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<Usuario> findByRolId(Long rolId);

    List<Usuario> findBySucursalId(Long sucursalId);

    List<Usuario> findByRolNombreRol(String nombreRol);

    List<Usuario> findBySucursalNombreSucursal(String nombreSucursal);

    List<Usuario> findByDeletedAtIsNotNull(); // Usuarios inactivos
}
