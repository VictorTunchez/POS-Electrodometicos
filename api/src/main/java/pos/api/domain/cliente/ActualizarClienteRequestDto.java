package pos.api.domain.cliente;

public record ActualizarClienteRequestDto(
        String nombre,
        String email,
        String telefono,
        String direccion,
        String tipoDocumento,
        String numeroDocumento
) {}