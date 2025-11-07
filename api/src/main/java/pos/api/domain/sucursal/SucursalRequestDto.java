package pos.api.domain.sucursal;

import jakarta.validation.constraints.NotBlank;


public record SucursalRequestDto(
        @NotBlank(message = "El nombre de la sucursal es obligatorio")
        String nombreSucursal,
        @NotBlank(message = "La direccion es obligatorio")
        String direccion,
        String telefono
) {}
