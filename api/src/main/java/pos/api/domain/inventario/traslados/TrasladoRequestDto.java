package pos.api.domain.inventario.traslados;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record TrasladoRequestDto(
        @NotNull Long sucursalOrigenId,
        @NotNull Long sucursalDestinoId,
        String observaciones,
        @NotEmpty List<DetalleTrasladoRequestDto> detalles
) {}