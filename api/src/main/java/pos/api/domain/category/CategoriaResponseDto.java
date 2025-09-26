package pos.api.domain.category;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public record CategoriaResponseDto(
        Long id,
        String nombreCategoria,
        String descripcion,
        String imagen,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt,
        Integer cantidadProductos
) {
    @JsonProperty("activo")
    public Boolean activo() {
        return deletedAt == null;
    }
}
