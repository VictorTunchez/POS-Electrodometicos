package pos.api.domain.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record ActualizarUsuarioRequestDto(
        @NotBlank(message = "Nombre es obligatorio")
        String nombre,
        @NotBlank(message = "Apellido es obligatorio")
        String apellido,
        @NotNull(message = "Correo es obligatorio")
        @Email(message = "El correo debe tener un formato válido")
        String email,
        @Pattern(
                regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_\\-+=\\[\\]{};':\"\\\\|,.<>\\/?])\\S{8,}$|^$",
                message = "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número, un carácter especial y no contener espacios, o estar vacía para no cambiar"
        )
        String contrasena,  // ← Puede ser null o empty
        Long sucursalId,
        @NotNull(message = "Es obligatorio asignar un rol")
        Long rolId
) {
}

