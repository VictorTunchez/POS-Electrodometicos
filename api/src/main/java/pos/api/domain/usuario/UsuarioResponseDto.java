package pos.api.domain.usuario;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public record UsuarioResponseDto(
        Long id,
        String email,
        String nombre,
        String apellido,
        String rolNombre,
        Long rolId,
        String sucursalNombre,
        Long sucursalId,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt,
        String creadoPor,
        String actualizadoPor
) {
    @JsonProperty("activo")
    public Boolean activo() {
        return deletedAt == null;
    }
}
