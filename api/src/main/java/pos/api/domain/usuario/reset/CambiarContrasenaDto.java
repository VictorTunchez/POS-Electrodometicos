package pos.api.domain.usuario.reset;

import jakarta.validation.constraints.NotBlank;

public record CambiarContrasenaDto(
        @NotBlank(message = "Token es obligatorio")
        String token,

        @NotBlank(message = "Contraseña es obligatoria")
        String nuevaContrasena
) {
}
