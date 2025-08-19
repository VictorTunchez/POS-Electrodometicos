package pos.api.domain.usuario.reset;

import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import pos.api.domain.usuario.IUsuarioRepository;
import pos.api.domain.usuario.Usuario;

import java.io.UnsupportedEncodingException;
import java.util.UUID;

@Service
public class CambiarContrasenaService {
    @Autowired
    private IUsuarioRepository repository;

    @Autowired
    private EmailService emailService;

    private final String frontendURL = "http://localhost:5173/cambiar-contrasena";

    // Genera temporal token y envía correo
    public void procesarSolicitudRecuperacion(String login) throws MessagingException, UnsupportedEncodingException {
        Usuario usuario = repository.findByLogin(login);
        if (usuario == null) throw new RuntimeException("Usuario no encontrado");

        String token = UUID.randomUUID().toString().replace("-", "").substring(0, 30);
        usuario.setResetContrasenaToken(token);
        repository.save(usuario);

        String link = frontendURL + "?token=" + token;
        emailService.sendResetPasswordEmail(login, link);
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
        usuario.setContrasena(encoder.encode(nuevaContrasena));
        usuario.setResetContrasenaToken(null);
        repository.save(usuario);
    }
}
