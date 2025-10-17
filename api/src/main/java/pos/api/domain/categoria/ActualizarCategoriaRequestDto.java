package pos.api.domain.categoria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ActualizarCategoriaRequestDto(
        @NotBlank(message = "El nombre de categoría es obligatorio")
        @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres")
        String nombreCategoria,

        String descripcion,

        // Imagen opcional
        String imagen
) {}
