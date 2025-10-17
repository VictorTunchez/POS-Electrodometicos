package pos.api.domain.listaPrecios;

import java.math.BigDecimal;
import java.time.Instant;

public record PrecioProductoResponseDto(
        Long id,
        Long productoId,
        String nombreProducto,
        Long unidadMedidaId,
        String unidadMedidaNombre,
        String unidadMedidaAbreviatura,
        TipoPrecio tipoPrecio,
        BigDecimal precio,
        Integer minimoCantidad,
        Boolean activo,
        Instant createdAt,
        Instant updatedAt
) {}
