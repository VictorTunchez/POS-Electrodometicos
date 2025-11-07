package pos.api.domain.usuario.rol;

public record PermisoResponseDto(
        Long id,
        String codigo,
        String descripcion,
        String categoria
) {}