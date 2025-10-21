package pos.api.domain.inventario.movimientos;

import java.math.BigDecimal;
import java.time.Instant;

public record MovimientoInventarioResponseDto(
        Long id,
        Long productoId,
        String nombreProducto,
        Long sucursalId,
        String nombreSucursal,
        TipoMovimiento tipoMovimiento,
        BigDecimal cantidad,
        BigDecimal stockAnterior,
        BigDecimal stockPosterior,
        String referenciaTipo,
        Long referenciaId,
        String observaciones,
        Long usuarioId,
        String nombreUsuario,
        Instant fechaMovimiento,
        Instant createdAt
) {}