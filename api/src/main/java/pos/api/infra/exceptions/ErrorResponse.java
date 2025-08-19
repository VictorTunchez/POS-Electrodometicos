package pos.api.infra.exceptions;

import java.util.List;

public record ErrorResponse(
        String codigo,
        String mensaje,
        List<DatosErrorValidacion> errores
) {
}
