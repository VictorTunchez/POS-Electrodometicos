package pos.api.domain.listaPrecios;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PrecioProductoRequestDto(
        @NotNull(message = "El producto es obligatorio")
        Long productoId,

        @NotNull(message = "La unidad de medida es obligatoria")
        Long unidadMedidaId,

        @NotNull(message = "El tipo de precio es obligatorio")
        TipoPrecio tipoPrecio,

        @NotNull(message = "El precio es obligatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a 0")
        BigDecimal precio,

        @NotNull(message = "La cantidad mínima es obligatoria")
        @Min(value = 1, message = "La cantidad mínima debe ser al menos 1")
        Integer minimoCantidad
) {}