package pos.api.domain.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaRequestDto(
        @NotBlank(message = "El nombre de categoría es obligatorio")
        @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres")
        String nombreCategoria,

        String descripcion,

        // Imagen opcional - sin validación @URL estricta
        String imagen
) {}
