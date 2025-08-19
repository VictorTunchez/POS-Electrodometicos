package pos.api.domain.usuario;

import org.springframework.data.jpa.repository.JpaRepository;

public interface IUsuarioRepository extends JpaRepository<Usuario, Long> {
    Usuario findByLogin(String login);
    Usuario findByResetContrasenaToken(String token);
}
