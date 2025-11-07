package pos.api.domain.inventario.traslados;

import java.math.BigDecimal;

public record DetalleTrasladoResponseDto(
        Long id,
        Long productoId,
        String nombreProducto,
        String codigoBarras,
        Long unidadMedidaId,
        String nombreUnidadMedida,
        String abreviaturaUnidadMedida,
        BigDecimal cantidad,
        BigDecimal cantidadEnUnidadBase
) {}
