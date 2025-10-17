package pos.api.controller;

import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.usuario.reset.OlvidoContrasenaDto;
import pos.api.domain.usuario.reset.CambiarContrasenaService;
import pos.api.domain.usuario.reset.CambiarContrasenaDto;

import java.io.UnsupportedEncodingException;


@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class CambiarContrasenaUsuarioController {

    @Autowired
    private CambiarContrasenaService cambiarContrasenaService;

    @PostMapping("/olvido-contrasena")
    public ResponseEntity<String> olvidoContrasena(@RequestBody @Valid OlvidoContrasenaDto request) throws MessagingException, UnsupportedEncodingException {
        // No importa si falla, siempre enviamos el mismo mensaje
        cambiarContrasenaService.procesarSolicitudRecuperacion(request.email());
        return ResponseEntity.ok("Se ha enviado un enlace de cambio de contraseña");
    }

    @PostMapping("/cambiar-contrasena")
    public ResponseEntity<String> cambiarContrasena(@RequestBody @Valid CambiarContrasenaDto request) {
            cambiarContrasenaService.cambiarContrasena(request.token(), request.nuevaContrasena());
            return ResponseEntity.ok("Contraseña cambiada exitosamente");
    }
}


