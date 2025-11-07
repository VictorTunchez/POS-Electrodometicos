package pos.api.domain.unidadMedida;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UnidadMedidaRequestDto(
        @NotBlank String nombre,
        @NotBlank String abreviatura,
        @NotNull TipoUnidad tipo,
        String descripcion
) {}