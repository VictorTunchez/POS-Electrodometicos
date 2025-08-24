package pos.api.user.reset;

import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import pos.api.infra.exceptions.validations.ContrasenaRepetidaException;
import pos.api.user.IUsuarioRepository;
import pos.api.user.Usuario;

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

    private final String frontendURL = "http://localhost:5173/cambiar-contrasena";

    // Genera temporal token y envía correo
    public void procesarSolicitudRecuperacion(String email) throws MessagingException, UnsupportedEncodingException {
        Usuario usuario = repository.findByEmail(email.toLowerCase());
        if (usuario == null) throw new RuntimeException("Usuario no encontrado");

        String token = UUID.randomUUID().toString().replace("-", "").substring(0, 30);
        usuario.setResetContrasenaToken(token);
        repository.save(usuario);

        String link = frontendURL + "?token=" + token;
        emailService.sendResetPasswordEmail(email, link);
    }

    //  Validar token
    public Usuario validarToken(String token) {
        return repository.findByResetContrasenaToken(token);
    }

    // Cambiar contraseña
    public void cambiarContrasena(String token, String nuevaContrasena) {
        Usuario usuario = validarToken(token);
        if (usuario == null) throw new RuntimeException("Token inválido o expirado");

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // Recuperar historial de hashes
        List<String> hashes = usuario.getHistorialContrasenas() != null
                ? new ArrayList<>(Arrays.asList(usuario.getHistorialContrasenas().split(",")))
                : new ArrayList<>();

        // Validar que la nueva contraseña no coincida con ninguna anterior
        for (String hash : hashes) {
            if (encoder.matches(nuevaContrasena, hash)) {
                throw new ContrasenaRepetidaException("La nueva contraseña no puede ser igual a una anterior");
            }
        }

        // Guardar la nueva contraseña y actualizar historial
        String nuevoHash = encoder.encode(nuevaContrasena);
        usuario.setContrasena(nuevoHash);
        usuario.setResetContrasenaToken(null);
        usuario.setLastPasswordChange(Instant.now());

        // Agregar al inicio del historial
        hashes.add(0, nuevoHash);

        // Mantener solo los últimos 5
        if (hashes.size() > 5) hashes = hashes.subList(0, 5);

        usuario.setHistorialContrasenas(String.join(",", hashes));
        repository.save(usuario);
    }

}
