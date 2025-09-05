package pos.api.controller;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.user.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PreAuthorize("@autorizacionService.tienePermiso('USUARIOS_CREAR')")
    @PostMapping
    @Transactional
    public ResponseEntity<UsuarioResponseDto> crearUsuario(@RequestBody @Valid UsuarioRequestDto dto,
                                                           @AuthenticationPrincipal Usuario creador) {
        UsuarioResponseDto response = usuarioService.crearUsuario(dto, creador);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('USUARIOS_VER')")
    @GetMapping
    public ResponseEntity<List<UsuarioResponseDto>> listarUsuarios() {
        List<UsuarioResponseDto> response = usuarioService.listarUsuarios();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('USUARIOS_OBTENERPORID')")
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDto> obtenerUsuario(@PathVariable Long id) {
        UsuarioResponseDto response = usuarioService.obtenerUsuario(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('USUARIOS_EDITAR')")
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<UsuarioResponseDto> actualizarUsuario(@PathVariable Long id,
                                                                @RequestBody @Valid ActualizarUsuarioRequestDto dto,
                                                                @AuthenticationPrincipal Usuario editor) {
        UsuarioResponseDto response = usuarioService.actualizarUsuario(id, dto, editor);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@autorizacionService.tienePermiso('USUARIOS_ELIMINAR')")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id,
                                                @AuthenticationPrincipal Usuario ejecutor) {
        usuarioService.eliminarUsuario(id, ejecutor);
        return ResponseEntity.noContent().build();
    }


    @PreAuthorize("@autorizacionService.tienePermiso('USUARIOS_ADMIN')")
    @PostMapping("/{id}/restaurar")
    @Transactional
    public ResponseEntity<Void> restaurarUsuario(@PathVariable Long id) {
        usuarioService.restaurarUsuario(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('USUARIOS_ADMIN')")
    @GetMapping("/todos")
    public ResponseEntity<List<UsuarioResponseDto>> listarTodosUsuarios() {
        List<UsuarioResponseDto> response = usuarioService.listarTodosUsuarios();
        return ResponseEntity.ok(response);
    }
}
