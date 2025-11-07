package pos.api.domain.venta;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record DetalleVentaRequestDto(
        @NotNull Long productoId,
        @NotNull Long unidadMedidaId,
        @NotNull @DecimalMin(value = "0.0001") BigDecimal cantidad,
        @NotNull @DecimalMin(value = "0.00") BigDecimal precioUnitario,
        @DecimalMin(value = "0.00") BigDecimal impuesto,
        @DecimalMin(value = "0.00") BigDecimal descuento
) {}
