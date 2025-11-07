package pos.api.domain.usuario.reset;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CambiarContrasenaDto(
        @NotBlank(message = "Token es obligatorio")
        String token,

        @NotBlank(message = "Contraseña es obligatoria")
        @Pattern(
                regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_\\-+=\\[\\]{};':\"\\\\|,.<>\\/?])\\S{8,}$",
                message = "La contraseña debe tener al menos 8 caracteres, una mayúscula, " +
                        "un número, un carácter especial y no contener espacios"
        )
        String nuevaContrasena
) {
}
