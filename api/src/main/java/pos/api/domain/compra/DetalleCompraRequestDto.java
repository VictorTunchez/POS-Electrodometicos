package pos.api.domain.compra;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record DetalleCompraRequestDto(
        @NotNull Long productoId,
        @NotNull Long unidadMedidaId,
        @NotNull @DecimalMin("0.0001") BigDecimal cantidad,
        @NotNull @DecimalMin("0.01") BigDecimal costoUnitario,
        @DecimalMin("0.00") BigDecimal impuesto,
        @DecimalMin("0.00") BigDecimal descuento
) {}
