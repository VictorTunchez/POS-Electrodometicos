package pos.api.domain.tarjetaRegalo;

import java.math.BigDecimal;
import java.time.Instant;

public record TarjetaRegaloResponseDto(
        Long id,
        String codigo,
        BigDecimal montoInicial,
        BigDecimal saldoActual,
        String moneda,
        Instant fechaEmision,
        Instant fechaExpiracion,
        EstadoTarjeta estado,
        String creadoPor,
        Instant createdAt,
        String modificadoPor,
        Instant updatedAt,
        String eliminadoPor,
        Instant deletedAt
) {}

