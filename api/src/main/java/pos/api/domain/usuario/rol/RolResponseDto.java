package pos.api.domain.usuario.rol;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.Set;

public record RolResponseDto(
        Long id,
        String nombreRol,
        String descripcion,
        Set<PermisoResponseDto> permisos,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt
) {
    @JsonProperty("activo")
    public Boolean activo() {
        return deletedAt == null;
    }
}
