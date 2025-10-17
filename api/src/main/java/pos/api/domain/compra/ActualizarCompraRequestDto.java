package pos.api.domain.compra;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public record ActualizarCompraRequestDto(
        @NotBlank String numeroFactura,
        String numeroControl,
        @NotNull Long proveedorId,
        @NotNull Long sucursalId,
        @NotNull Instant fechaCompra,
        String observaciones,
        List<DetalleCompraRequestDto> detalles
) {}