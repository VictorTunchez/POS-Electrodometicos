package pos.api.domain.venta;

public record PagoResponseDto(
        String status,
        String message,
        String sessionId,
        String sessionUrl
) {}
