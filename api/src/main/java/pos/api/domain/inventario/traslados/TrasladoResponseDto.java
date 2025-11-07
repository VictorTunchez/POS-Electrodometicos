package pos.api.domain.inventario.traslados;

import java.time.Instant;
import java.util.List;

public record TrasladoResponseDto(
        Long id,
        Long sucursalOrigenId,
        String nombreSucursalOrigen,
        Long sucursalDestinoId,
        String nombreSucursalDestino,
        Long usuarioId,
        String nombreUsuario,
        Instant fechaTraslado,
        EstadoTraslado estado,
        String observaciones,
        List<DetalleTrasladoResponseDto> detalles,
        Instant createdAt,
        Instant updatedAt
) {}
