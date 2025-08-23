package pos.api.user;

import org.springframework.data.jpa.repository.JpaRepository;

public interface IUsuarioRepository extends JpaRepository<Usuario, Long> {
    Usuario findByEmail(String email);
    Usuario findByResetContrasenaToken(String token);
}
