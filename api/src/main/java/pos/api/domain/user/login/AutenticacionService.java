package pos.api.domain.user.login;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pos.api.domain.user.IUsuarioRepository;
import pos.api.domain.user.Usuario;
import java.time.Instant;

@Service
public class AutenticacionService implements UserDetailsService {

    @Autowired
    private IUsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder; // ya tienes BCrypt en SecurityConfig

    public Usuario login(String email, String contrasena) {
        Usuario usuario = repository.findByEmail(email.toLowerCase());

        // Validaciones combinadas
        if (usuario == null ||
                usuario.getDeletedAt() != null ||
                !passwordEncoder.matches(contrasena, usuario.getContrasena())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        // Actualiza la fecha de último login para invalidar tokens antiguos
        usuario.setLastPasswordChange(Instant.now());
        repository.save(usuario);

        return usuario;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = repository.findByEmail(email.toLowerCase());
        if (usuario == null) {
            throw new UsernameNotFoundException("Usuario no encontrado");
        }
        return usuario;
    }
}

