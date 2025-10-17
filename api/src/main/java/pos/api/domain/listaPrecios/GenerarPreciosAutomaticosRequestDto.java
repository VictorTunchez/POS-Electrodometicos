package pos.api.domain.listaPrecios;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record GenerarPreciosAutomaticosRequestDto(
        @NotNull Long productoId,
        @DecimalMin(value = "0.0", message = "El margen no puede ser negativo")
        @DecimalMax(value = "100.0", message = "El margen no puede ser mayor a 100%")
        BigDecimal porcentajeMargen
) {}