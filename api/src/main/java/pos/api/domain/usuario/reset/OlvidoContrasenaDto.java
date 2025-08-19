package pos.api.domain.usuario.reset;

import jakarta.validation.constraints.NotBlank;

public record OlvidoContrasenaDto(
        @NotBlank(message = "Login es obligatorio")
        String login
) {
}
