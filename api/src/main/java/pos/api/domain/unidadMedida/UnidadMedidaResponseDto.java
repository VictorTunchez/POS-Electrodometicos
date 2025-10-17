package pos.api.domain.unidadMedida;

import java.time.Instant;

public record UnidadMedidaResponseDto(
        Long id,
        String nombre,
        String abreviatura,
        TipoUnidad tipo,
        String descripcion,
        Boolean activo,
        Instant createdAt,
        Instant updatedAt
) {}