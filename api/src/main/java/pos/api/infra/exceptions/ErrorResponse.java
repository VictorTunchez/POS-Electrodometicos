package pos.api.infra.exceptions;
import java.util.Map;

public record ErrorResponse(
        String mensaje,
        Map<String, String> detalles
) {
    public static ErrorResponse simple(String mensaje) {
        return new ErrorResponse(mensaje, Map.of());
    }

    public static ErrorResponse conDetalles(String mensaje, Map<String, String> detalles) {
        return new ErrorResponse(mensaje, detalles);
    }
}
