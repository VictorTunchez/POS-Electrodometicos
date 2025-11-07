package pos.api.domain.inventario.traslados;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record DetalleTrasladoRequestDto(
        @NotNull Long productoId,
        @NotNull Long unidadMedidaId,
        @NotNull @Positive BigDecimal cantidad
) {}
