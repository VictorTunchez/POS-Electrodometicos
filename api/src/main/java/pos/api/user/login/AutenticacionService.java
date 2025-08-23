package pos.api.user.login;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import pos.api.user.IUsuarioRepository;

@Service
public class AutenticacionService implements UserDetailsService {
    @Autowired
    private IUsuarioRepository repository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var usuario = repository.findByEmail(email.toLowerCase());
        if (usuario == null) {
            throw new BadCredentialsException("Credenciales inválidas");
        }
        return usuario;
    }
}
