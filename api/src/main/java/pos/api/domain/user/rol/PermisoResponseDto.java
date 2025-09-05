package pos.api.domain.user.rol;

public record PermisoResponseDto(
        Long id,
        String codigo,
        String descripcion,
        String categoria
) {}