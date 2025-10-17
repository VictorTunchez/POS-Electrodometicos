package pos.api.domain.producto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProductoRequestDto(
        @NotBlank(message = "El nombre del producto es obligatorio")
        @Size(max = 200, message = "El nombre no puede exceder los 200 caracteres")
        String nombreProducto,

        String codigoBarras,

        String descripcion,

//        @NotNull(message = "El precio de compra es obligatorio")
//        @DecimalMin(value = "0.0", inclusive = false, message = "El precio de compra debe ser mayor a 0")
//        BigDecimal precioCompra,

        String imagen,

        @NotNull(message = "La categoría es obligatoria")
        Long categoriaId,

        // Campos de unidad de medida
        @NotNull(message = "La unidad de medida es obligatoria")
        Long unidadMedidaId,

        Long unidadCompraId,

        @DecimalMin(value = "0.0001", inclusive = false, message = "El factor de conversión debe ser mayor a 0")
        BigDecimal factorConversion,

        // NUEVO: Campos para el sistema de precios
        @DecimalMin(value = "0.0", message = "El margen no puede ser negativo")
        @DecimalMax(value = "100.0", message = "El margen no puede ser mayor a 100%")
        BigDecimal margenDefault,

        Boolean generarPreciosAutomaticos,

        Boolean destacado
) {}