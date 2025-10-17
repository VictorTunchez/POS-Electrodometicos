package pos.api.domain.venta;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record VentaRequestDto(
        Long clienteId, // Puede ser null para ventas anónimas
        @NotNull Long sucursalId,
        @NotNull Long usuarioId,
        @NotNull TipoVenta tipoVenta,
        @NotNull FormaPago formaPago,
        String observaciones,
        List<DetalleVentaRequestDto> detalles
) {}
