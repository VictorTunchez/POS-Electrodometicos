package pos.api.infra.exceptions.validations;

public class ContrasenaRepetidaException extends RuntimeException {
    public ContrasenaRepetidaException(String mensaje) {
        super(mensaje);
    }
}

