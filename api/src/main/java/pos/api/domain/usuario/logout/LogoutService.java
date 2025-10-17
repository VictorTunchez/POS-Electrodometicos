package pos.api.domain.usuario.logout;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import pos.api.domain.usuario.IUsuarioRepository;
import pos.api.domain.usuario.Usuario;

import java.time.Instant;

@Service
@AllArgsConstructor
public class LogoutService {

    private final IUsuarioRepository usuarioRepository;

    @Transactional
    public void logout(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Usuario)) {
            throw new SecurityException("Usuario no autenticado");
        }

        Usuario usuario = (Usuario) authentication.getPrincipal();
        // Actualiza lastPasswordChange para invalidar tokens actuales
        usuario.setLastPasswordChange(Instant.now());
        usuarioRepository.save(usuario);
    }
}
