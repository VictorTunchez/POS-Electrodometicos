package pos.api.domain.tarjetaRegalo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record ActualizarTarjetaRegaloRequestDto(
        @NotBlank String codigo,
        @NotNull Instant fechaExpiracion
) {}

