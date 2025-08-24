package pos.api.infra.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import pos.api.user.Usuario;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;


@Service
public class TokenService {

    private String secret = "pruebalogin_v1";

    public String generarToken(Usuario usuario){
        try {
            var algoritmo = Algorithm.HMAC256(secret);
            return  JWT.create()
                    .withIssuer("API pos.login")
                    .withSubject(usuario.getEmail())
                    .withClaim("lastPasswordChange", usuario.getLastPasswordChange() != null
                            ? usuario.getLastPasswordChange().toEpochMilli() : 0)
                    .withExpiresAt(fechaExpiracion())
                    .sign(algoritmo);
        } catch (JWTCreationException exception){
            // Invalid Signing configuration / Couldn't convert Claims.
            throw new RuntimeException("Error al generar el token JWT", exception);
        }
    }

    private Instant fechaExpiracion() {
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-06:00"));
    }

    public String getSubject(String tokenJwt, long lastPasswordChange) {
        try {
            var algoritmo = Algorithm.HMAC256(secret);

            // Verifica el token y obtiene el objeto DecodedJWT
            DecodedJWT decodedJWT = JWT.require(algoritmo)
                    .withIssuer("API pos.login")
                    .build()
                    .verify(tokenJwt);

            // Extrae el claim "lastPasswordChange" del token
            Long tokenPasswordChange = decodedJWT.getClaim("lastPasswordChange").asLong();

            // Si el token es anterior al último cambio de contraseña, se invalida
            if (tokenPasswordChange == null || tokenPasswordChange < lastPasswordChange) {
                throw new RuntimeException("Token JWT inválido o expirado");
            }

            return decodedJWT.getSubject(); // retorna el email del usuario
        } catch (JWTVerificationException exception) {
            throw new RuntimeException("Token JWT inválido o expirado");
        }
    }

}
