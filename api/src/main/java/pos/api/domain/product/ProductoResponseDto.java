package pos.api.domain.product;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductoResponseDto(
        Long id,
        String codigoBarras,
        String nombreProducto,
        String descripcion,
        BigDecimal precioCompra,
        BigDecimal precioVenta,
        String imagen,
        Long categoriaId,
        String nombreCategoria,
//        String estado,
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
