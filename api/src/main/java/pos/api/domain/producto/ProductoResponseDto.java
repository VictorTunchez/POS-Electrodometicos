package pos.api.domain.producto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ProductoResponseDto(
        Long id,
        String codigoBarras,
        String nombreProducto,
        String descripcion,
        BigDecimal ultimoCosto,
        BigDecimal costoPromedio,
        String imagen,
        Long categoriaId,
        String nombreCategoria,
        // Campos de unidad de medida
        Long unidadMedidaId,
        String unidadMedidaNombre,
        String unidadMedidaAbreviatura,
        Long unidadCompraId,
        String unidadCompraNombre,
        String unidadCompraAbreviatura,
        BigDecimal factorConversion,
        // NUEVO: Campos del sistema de precios
        BigDecimal margenDefault,
        List<PrecioSimpleResponseDto> precios,
        Boolean destacado,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt
) {
    @JsonProperty("activo")
    public Boolean activo() {
        return deletedAt == null;
    }
}