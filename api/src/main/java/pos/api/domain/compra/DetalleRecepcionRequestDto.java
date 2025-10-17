package pos.api.domain.compra;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record DetalleRecepcionRequestDto(
        @NotNull Long detalleCompraId,
        @NotNull @DecimalMin("0.0001") BigDecimal cantidadRecibida
) {}
