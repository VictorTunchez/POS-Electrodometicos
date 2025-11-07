package pos.api.domain.usuario.login;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record AutenticacionDto(
         @NotNull(message = "Correo es obligatorio")
         @Email(message = "El correo no debe contener espacios y debe tener un formato válido (ej: usuario@dominio.com)")
         String email,
         @NotBlank(message = "Formato de contraseña invalido")
         @Pattern(
                 regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_\\-+=\\[\\]{};':\"\\\\|,.<>\\/?])\\S{8,}$",
                 message = "La contraseña debe tener al menos 8 caracteres, " +
                         "una mayúscula, un número, un carácter especial y no contener espacios"
         )
         String contrasena
) {
}
