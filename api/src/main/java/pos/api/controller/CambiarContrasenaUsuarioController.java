package pos.api.controller;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pos.api.user.reset.OlvidoContrasenaDto;
import pos.api.user.reset.CambiarContrasenaService;
import pos.api.user.reset.CambiarContrasenaDto;


@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class CambiarContrasenaUsuarioController {
    @Autowired
    private CambiarContrasenaService cambiarContrasenaService;

    // Endpoint para solicitar recuperación de contraseña
    @PostMapping("/olvido-contrasena")
    @Transactional
    public ResponseEntity<?> olvidoContrasena(@RequestBody OlvidoContrasenaDto request) {
        try {
            cambiarContrasenaService.procesarSolicitudRecuperacion(request.email());
            return ResponseEntity.ok("Se ha enviado un enlace de recuperación a su correo");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint para cambiar contraseña con el token
    @PostMapping("/cambiar-contrasena")
    @Transactional
    public ResponseEntity<?> cambiarContrasena(@RequestBody CambiarContrasenaDto request) {
        try {
            cambiarContrasenaService.cambiarContrasena(request.token(), request.nuevaContrasena());
            return ResponseEntity.ok("La contraseña se ha cambiado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
