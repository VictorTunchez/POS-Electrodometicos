package pos.api.domain.proveedor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProveedorRequestDto(
        @NotBlank(message = "La razón social es obligatoria")
        @Size(max = 200, message = "La razón social no puede exceder los 200 caracteres")
        String razonSocial,

        @Size(max = 200, message = "El nombre comercial no puede exceder los 200 caracteres")
        String nombreComercial,

        @NotBlank(message = "El NIT es obligatorio")
        @Pattern(regexp = "^[0-9]{1,8}-[0-9kK]$", message = "Formato de NIT inválido. Debe ser: 1234567-8")
        String nit,

        @Size(max = 300, message = "La dirección no puede exceder los 300 caracteres")
        String direccion,

        @Size(max = 50, message = "El departamento no puede exceder los 50 caracteres")
        String departamento,

        @Size(max = 50, message = "El municipio no puede exceder los 50 caracteres")
        String municipio,

        @Pattern(regexp = "^[0-9+\\-\\s()]{8,20}$", message = "Formato de teléfono inválido")
        String telefono,

        @Email(message = "El formato del email es inválido")
        @Size(max = 100, message = "El email no puede exceder los 100 caracteres")
        String email,

        @Size(max = 100, message = "El nombre del contacto no puede exceder los 100 caracteres")
        String contactoNombre,

        @Pattern(regexp = "^[0-9+\\-\\s()]{8,20}$", message = "Formato de teléfono de contacto inválido")
        String contactoTelefono,

        String observaciones
) {}