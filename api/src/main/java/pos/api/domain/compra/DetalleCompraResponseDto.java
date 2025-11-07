package pos.api.domain.compra;

import java.math.BigDecimal;

public record DetalleCompraResponseDto(
        Long id,
        Long productoId,
        String productoNombre,
        String productoCodigoBarras,
        Long unidadMedidaId,
        String unidadMedidaNombre,
        String unidadMedidaAbreviatura,
        BigDecimal cantidad,
        BigDecimal cantidadRecibida,
        BigDecimal costoUnitario,
        BigDecimal subtotal,
        BigDecimal impuesto,
        BigDecimal descuento,
        BigDecimal total
) {}
