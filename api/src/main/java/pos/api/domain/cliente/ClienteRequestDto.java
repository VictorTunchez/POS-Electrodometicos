package pos.api.domain.cliente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClienteRequestDto(
        @NotBlank String nombre,
        @Email String email,
        String telefono,
        String direccion,
        String tipoDocumento,
        String numeroDocumento
) {}