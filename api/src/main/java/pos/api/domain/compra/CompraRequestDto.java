package pos.api.domain.compra;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public record CompraRequestDto(
        @NotBlank String numeroFactura,
        String numeroControl,
        @NotNull Long proveedorId,
        @NotNull Long sucursalId,
        Instant fechaCompra,
        Instant fechaRecepcion,
        String observaciones,
        @NotNull @Valid List<DetalleCompraRequestDto> detalles
) {}
