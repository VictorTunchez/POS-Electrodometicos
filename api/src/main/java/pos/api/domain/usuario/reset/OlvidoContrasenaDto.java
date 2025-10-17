package pos.api.domain.usuario.reset;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OlvidoContrasenaDto(
        @NotBlank(message = "Correo es obligatorio")
        @Email(message = "El correo no debe contener espacios y debe tener un formato válido (ej: usuario@dominio.com)")
        String email
) {
}
