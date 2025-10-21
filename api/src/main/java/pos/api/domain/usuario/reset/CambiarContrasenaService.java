package pos.api.domain.usuario.reset;

import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pos.api.domain.usuario.IUsuarioRepository;
import pos.api.domain.usuario.Usuario;

import java.io.UnsupportedEncodingException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class CambiarContrasenaService {
    @Autowired
    private IUsuarioRepository repository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${frontend.url.public}")
    private String frontendPublic;

    // Genera temporal token y envía correo
    public void procesarSolicitudRecuperacion(String email) throws MessagingException, UnsupportedEncodingException {
        Usuario usuario = repository.findByEmail(email.toLowerCase());

        // VALIDACIÓN AGREGADA: Rechazar usuarios eliminados
        if (usuario == null || usuario.getDeletedAt() != null) {
            // Por seguridad, mismo mensaje aunque el usuario esté eliminado
            throw new RuntimeException("Si el email existe, recibirá un enlace de recuperación");
        }

        String token = UUID.randomUUID().toString().replace("-", "").substring(0, 30);
        usuario.setResetContrasenaToken(token);
        repository.save(usuario);

        String link = frontendPublic + "/cambiar-contrasena?token=" + token;
        emailService.sendResetPasswordEmail(email, link);
    }

    // Validar token
    public Usuario validarToken(String token) {
        Usuario usuario = repository.findByResetContrasenaToken(token);

        // VALIDACIÓN AGREGADA: Rechazar tokens de usuarios eliminados
        if (usuario != null && usuario.getDeletedAt() != null) {
            return null; // Token inválido porque usuario fue eliminado
        }

        return usuario;
    }

    // Cambiar contraseña
    public void cambiarContrasena(String token, String nuevaContrasena) {
        Usuario usuario = validarToken(token);

        // DOBLE VALIDACIÓN: Por si acaso
        if (usuario == null || usuario.getDeletedAt() != null) {
            throw new RuntimeException("Token inválido o expirado");
        }

        // Recuperar historial de hashes
        List<String> hashes = usuario.getHistorialContrasenas() != null
                ? new ArrayList<>(Arrays.asList(usuario.getHistorialContrasenas().split(",")))
                : new ArrayList<>();

        // Validar que la nueva contraseña no coincida con ninguna anterior
        for (String hash : hashes) {
            if (passwordEncoder.matches(nuevaContrasena, hash)) {
                throw new IllegalArgumentException("La nueva contraseña no puede ser igual a una anterior");
            }
        }

        // Guardar la nueva contraseña y actualizar historial
        String nuevoHash = passwordEncoder.encode(nuevaContrasena);
        usuario.setContrasena(nuevoHash);
        usuario.setResetContrasenaToken(null);
        usuario.setLastPasswordChange(Instant.now());

        // Agregar al inicio del historial
        hashes.add(0, nuevoHash);

        // Mantener solo los últimos 5
        if (hashes.size() > 5) {
            hashes = hashes.subList(0, 5);
        }

        usuario.setHistorialContrasenas(String.join(",", hashes));
        repository.save(usuario);
    }
}

