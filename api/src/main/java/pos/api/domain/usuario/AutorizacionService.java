package pos.api.domain.usuario;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("autorizacionService")
@RequiredArgsConstructor
public class AutorizacionService {

    private final IUsuarioRepository usuarioRepository;

    public boolean tienePermiso(String permisoCodigo) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Usuario usuario = usuarioRepository.findByEmail(username);
        if (usuario == null) {
            return false;
        }

        // Verificar que el rol y los permisos no sean nulos
        if (usuario.getRol() == null || usuario.getRol().getPermisos() == null) {
            return false;
        }

        return usuario.getRol().getPermisos().stream()
                .anyMatch(permiso -> permiso.getCodigo().equals(permisoCodigo));
    }
}
