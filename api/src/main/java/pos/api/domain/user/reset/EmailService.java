package pos.api.domain.user.reset;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendResetPasswordEmail(String recipientEmail, String link) throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom("enrique561aa@gmail.com", "Soporte POS");
        helper.setTo(recipientEmail);

        String subject = "Enlace para restablecer tu contraseña";
        String content = "<p>Hola,</p>"
                + "<p>Has solicitado restablecer tu contraseña.</p>"
                + "<p>Haz clic en el siguiente enlace para cambiarla:</p>"
                + "<p><a href=\"" + link + "\">Cambiar mi contraseña</a></p>"
                + "<br>"
                + "<p>Si recuerdas tu contraseña o no realizaste la solicitud, ignora este correo.</p>";

        helper.setSubject(subject);
        helper.setText(content, true);

        mailSender.send(message);
    }
}

