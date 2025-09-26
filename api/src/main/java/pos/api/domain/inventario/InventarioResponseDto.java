package pos.api.domain.inventario;


import java.time.Instant;

public record InventarioResponseDto(
        Long id,
        Long productoId,
        String nombreProducto,
        String codigoBarras,
        Long sucursalId,
        String nombreSucursal,
        Integer stockActual,
        Integer stockMinimo,
        Instant fechaActualizacion,
        Instant createdAt,
        Instant updatedAt
) {
}
