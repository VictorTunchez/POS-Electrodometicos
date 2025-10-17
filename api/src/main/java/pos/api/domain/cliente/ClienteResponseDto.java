package pos.api.domain.cliente;

import java.time.Instant;

public record ClienteResponseDto(
        Long id,
        String nombre,
        String email,
        String telefono,
        String direccion,
        String tipoDocumento,
        String numeroDocumento,
        Instant createdAt,
        Instant updatedAt
) {}