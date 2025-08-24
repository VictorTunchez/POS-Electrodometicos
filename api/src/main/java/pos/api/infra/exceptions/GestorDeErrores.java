package pos.api.infra.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pos.api.infra.exceptions.validations.ContrasenaRepetidaException;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GestorDeErrores {

    @ExceptionHandler({BadCredentialsException.class, AuthenticationException.class})
    public ResponseEntity<ErrorResponse> manejarErroresDeLogin() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(ErrorResponse.simple("Credenciales inválidas"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> manejarAccesoDenegado() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .contentType(MediaType.APPLICATION_JSON)
                .body(ErrorResponse.simple("Acceso denegado"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> manejarErroresValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage));

        return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(ErrorResponse.conDetalles("Error de validación en uno o más campos", errores));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> manejarErroresGenerales(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(ErrorResponse.simple("Ocurrió un error interno: " + ex.getMessage()));
    }

    @ExceptionHandler(ContrasenaRepetidaException.class)
    public ResponseEntity<ErrorResponse> manejarContrasenaRepetida(ContrasenaRepetidaException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(ErrorResponse.simple(ex.getMessage()));
    }
}

