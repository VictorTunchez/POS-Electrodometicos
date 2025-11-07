package pos.api.domain.producto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ActualizarProductoRequestDto(
        @NotBlank(message = "El nombre del producto es obligatorio")
        @Size(max = 200, message = "El nombre no puede exceder los 200 caracteres")
        String nombreProducto,

        String codigoBarras,

        String descripcion,

        String imagen,

        @NotNull(message = "La categoría es obligatoria")
        Long categoriaId,

        @NotNull(message = "La unidad de medida es obligatoria")
        Long unidadMedidaId,

        Long unidadCompraId,

        @DecimalMin(value = "0.0001", inclusive = false, message = "El factor de conversión debe ser mayor a 0")
        BigDecimal factorConversion,

        // NUEVO: Campo para margen
        @DecimalMin(value = "0.0", message = "El margen no puede ser negativo")
        @DecimalMax(value = "100.0", message = "El margen no puede ser mayor a 100%")
        BigDecimal margenDefault,

        Boolean destacado
) {}