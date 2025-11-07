package pos.api.domain.listaPrecios;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CalcularPrecioRequestDto(
        @NotNull Long productoId,
        @NotNull Long unidadMedidaId,
        @NotNull @Min(1) Integer cantidad,
        TipoPrecio tipoPrecio
) {}
