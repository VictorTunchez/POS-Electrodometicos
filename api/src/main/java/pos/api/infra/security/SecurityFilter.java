package pos.api.infra.security;

import com.auth0.jwt.JWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import pos.api.user.IUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import pos.api.user.Usuario;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private IUsuarioRepository repository;

    @Autowired
    private TokenService tokenService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String tokenJwt = recuperarToken(request);

        if (tokenJwt != null) {
            try {
                // Decodifica temporalmente para obtener el email
                String email = JWT.decode(tokenJwt).getSubject();

                // Busca usuario en base de datos
                Usuario usuario = repository.findByEmail(email.toLowerCase());
                if (usuario == null) {
                    throw new RuntimeException("Usuario no encontrado");
                }

                // Valida token incluyendo lastPasswordChange
                tokenService.getSubject(tokenJwt, usuario.getLastPasswordChange().toEpochMilli());

                // Autenticación Spring Security
                var authentication = new UsernamePasswordAuthenticationToken(
                        usuario, null, usuario.getAuthorities()
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (RuntimeException ex) {
                // Limpia el contexto y lanza excepción para que tu GlobalExceptionHandler la capture
                SecurityContextHolder.clearContext();
                throw ex;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        String autorizacionHeader = request.getHeader("Authorization");
        if (autorizacionHeader != null && autorizacionHeader.startsWith("Bearer ")) {
            return autorizacionHeader.replace("Bearer ", "");
        }
        return null;
    }
}

