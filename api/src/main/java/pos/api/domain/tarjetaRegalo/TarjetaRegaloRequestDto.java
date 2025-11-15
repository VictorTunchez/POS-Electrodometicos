package pos.api.domain.tarjetaRegalo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;

public record TarjetaRegaloRequestDto(
        @NotBlank String codigo,
        @NotNull BigDecimal montoInicial,
        @NotNull String moneda,
        @NotNull Instant fechaExpiracion
) {}

