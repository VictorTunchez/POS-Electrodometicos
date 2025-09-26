package pos.api.domain.inventario;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventarioRequestDto(
        @NotNull(message = "El producto es obligatorio")
        Long productoId,

        @NotNull(message = "La sucursal es obligatorio")
        Long sucursalId,

        @NotNull(message = "El stock actual es obligatorio")
        @Min(value = 0, message = "El stock actual no puede ser negativo")
        Integer stockActual,

        @NotNull(message = "El stock mínimo es obligatorio")
        @Min(value = 0, message = "El stock mínimo no puede ser negativo")
        Integer stockMinimo
) {}
