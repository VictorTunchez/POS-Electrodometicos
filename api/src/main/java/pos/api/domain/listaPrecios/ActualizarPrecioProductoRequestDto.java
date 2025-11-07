package pos.api.domain.listaPrecios;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ActualizarPrecioProductoRequestDto(
        @NotNull(message = "El precio es obligatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a 0")
        BigDecimal precio,

        @NotNull(message = "La cantidad mínima es obligatoria")
        @Min(value = 1, message = "La cantidad mínima debe ser al menos 1")
        Integer minimoCantidad,

        Boolean activo
) {}
