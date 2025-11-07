package pos.api.domain.venta;

import java.math.BigDecimal;

public record DetalleVentaResponseDto(
        Long id,
        Long productoId,
        String productoNombre,
        String codigoBarras,
        Long unidadMedidaId,
        String unidadMedidaNombre,
        String unidadMedidaAbreviatura,
        BigDecimal cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal,
        BigDecimal impuesto,
        BigDecimal descuento,
        BigDecimal total
) {}
