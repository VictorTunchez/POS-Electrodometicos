package pos.api.domain.compra;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CompraResponseDto(
        Long id,
        String numeroFactura,
        String numeroControl,
        Long proveedorId,
        String proveedorRazonSocial,
        Long sucursalId,
        String sucursalNombre,
        Instant fechaCompra,
        Instant fechaRecepcion,
        EstadoCompra estado,
        BigDecimal subtotal,
        BigDecimal impuesto,
        BigDecimal descuento,
        BigDecimal total,
        String observaciones,
        List<DetalleCompraResponseDto> detalles,
        Instant createdAt,
        Instant updatedAt
) {}