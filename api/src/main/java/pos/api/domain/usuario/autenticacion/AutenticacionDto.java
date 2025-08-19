package pos.api.domain.usuario.autenticacion;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AutenticacionDto(
         @Email(message = "Formato de correo invalido") String login,
         @NotBlank(message = "Formato de contraseña invalido") String contrasena
) {

}
