package pos.api.domain.producto;

import pos.api.domain.listaPrecios.TipoPrecio;

import java.math.BigDecimal;

public record PrecioSimpleResponseDto(
        Long id,
        Long unidadMedidaId,
        String unidadMedidaNombre,
        String unidadMedidaAbreviatura,
        TipoPrecio tipoPrecio,
        BigDecimal precio,
        Integer minimoCantidad
) {}
