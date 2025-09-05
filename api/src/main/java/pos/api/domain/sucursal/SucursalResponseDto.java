package pos.api.domain.sucursal;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public record SucursalResponseDto(
        Long id,
        String nombreSucursal,
        String direccion,
        String telefono,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt
) {
    @JsonProperty("activo")
    public Boolean activo() {
        return deletedAt == null;
    }
}
