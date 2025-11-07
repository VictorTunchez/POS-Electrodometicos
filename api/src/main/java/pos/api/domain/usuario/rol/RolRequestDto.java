package pos.api.domain.usuario.rol;

import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record RolRequestDto(
        @NotNull(message = "nombreRol es obligatorio")
        String nombreRol,
        String descripcion,
        Set<Long> permisoIds
) {
}
