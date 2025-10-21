package pos.api.domain.inventario.ajustes;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record AjusteInventarioRequestDto(
        @NotNull Long productoId,
        @NotNull Long sucursalId,
        @NotNull @Positive BigDecimal cantidad,
        @NotNull TipoAjuste tipoAjuste,
        @NotBlank String motivo,
        String observaciones
) {}