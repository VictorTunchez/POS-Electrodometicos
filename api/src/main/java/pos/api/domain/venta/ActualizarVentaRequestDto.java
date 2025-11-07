package pos.api.domain.venta;

import java.util.List;

public record ActualizarVentaRequestDto(
        String observaciones,
        List<DetalleVentaRequestDto> detalles
) {}
