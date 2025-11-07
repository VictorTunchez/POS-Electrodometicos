package pos.api.domain.proveedor;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public record ProveedorResponseDto(
        Long id,
        String razonSocial,
        String nombreComercial,
        String nit,
        String direccion,
        String departamento,
        String municipio,
        String telefono,
        String email,
        String contactoNombre,
        String contactoTelefono,
        String observaciones,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt
) {
    @JsonProperty("activo")
    public Boolean activo() {
        return deletedAt == null;
    }
}