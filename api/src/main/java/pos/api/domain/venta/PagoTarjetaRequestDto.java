package pos.api.domain.venta;

import jakarta.validation.constraints.NotNull;

public record PagoTarjetaRequestDto(
        @NotNull Long ventaId,
        String ultimosDigitosTarjeta,
        String tipoTarjeta,
        Integer cantidadCuotas
) {}