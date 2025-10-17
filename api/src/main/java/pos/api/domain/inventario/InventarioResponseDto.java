package pos.api.domain.inventario;


import java.math.BigDecimal;
import java.time.Instant;

public record InventarioResponseDto(
        Long id,
        Long productoId,
        String nombreProducto,
        String codigoBarras,
        Long sucursalId,
        String nombreSucursal,
        BigDecimal stockActual,
        BigDecimal stockMinimo,
        Instant fechaActualizacion,
        Instant createdAt,
        Instant updatedAt
) {}
