package pos.api.domain.inventario;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record InventarioRequestDto(
        @NotNull(message = "El producto es obligatorio")
        Long productoId,

        @NotNull(message = "La sucursal es obligatorio")
        Long sucursalId,

        @DecimalMin(value = "0.0", message = "El stock mínimo no puede ser negativo")
        BigDecimal stockMinimo
) {}
