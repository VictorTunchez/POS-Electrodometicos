package pos.api.domain.inventario.ajustes;

import java.math.BigDecimal;
import java.time.Instant;

public record AjusteInventarioResponseDto(
        Long id,
        Long productoId,
        String nombreProducto,
        String codigoBarras,
        Long sucursalId,
        String nombreSucursal,
        BigDecimal stockAnterior,
        BigDecimal stockNuevo,
        BigDecimal diferencia,
        TipoAjuste tipoAjuste,
        String motivo,
        String observaciones,
        Long usuarioId,
        String nombreUsuario,
        Instant fechaAjuste,
        Instant createdAt
) {}