package pos.api.infra.exceptions;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GestorDeErrores {

    // Unificado para cualquier error de login
    @ExceptionHandler({BadCredentialsException.class, AuthenticationException.class})
    public ResponseEntity<ErrorResponse> manejarErroresDeLogin() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("AUTH_001", "Credenciales inválidas", List.of()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> gestionarErrorAccesoDenegado() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("AUTH_003", "Acceso denegado", List.of()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> manejarErroresValidacion(MethodArgumentNotValidException ex) {
        List<DatosErrorValidacion> errores = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(DatosErrorValidacion::new)
                .toList();

        return ResponseEntity.badRequest()
                .body(new ErrorResponse("VALIDACION_001", "Error de validación en uno o más campos", errores));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> gestionarError500(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("ERR_500", "Error interno: " + ex.getLocalizedMessage(), List.of()));
    }
}
