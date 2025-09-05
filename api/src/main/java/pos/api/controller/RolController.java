package pos.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.user.rol.PermisoResponseDto;
import pos.api.domain.user.rol.RolRequestDto;
import pos.api.domain.user.rol.RolResponseDto;
import pos.api.domain.user.rol.RolService;
import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RolController {

    private final RolService rolService;

    @PreAuthorize("@autorizacionService.tienePermiso('ROLES_CREAR')")
    @PostMapping
    public ResponseEntity<RolResponseDto> crearRol(@RequestBody RolRequestDto request) {
        RolResponseDto response = rolService.crearRol(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('ROLES_VER')")
    @GetMapping
    public ResponseEntity<List<RolResponseDto>> listarRoles() {
        return ResponseEntity.ok(rolService.listarRoles());
    }

    @PreAuthorize("@autorizacionService.tienePermiso('ROLES_OBTENERPORID')")
    @GetMapping("/{id}")
    public ResponseEntity<RolResponseDto> obtenerRolPorId(@PathVariable Long id) {
        return ResponseEntity.ok(rolService.obtenerRolPorId(id));
    }

    @PreAuthorize("@autorizacionService.tienePermiso('ROLES_EDITAR')")
    @PutMapping("/{id}")
    public ResponseEntity<RolResponseDto> actualizarRol(
            @PathVariable Long id,
            @RequestBody RolRequestDto request) {
        return ResponseEntity.ok(rolService.actualizarRol(id, request));
    }

    @PreAuthorize("@autorizacionService.tienePermiso('ROLES_ELIMINAR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRol(@PathVariable Long id) {
        rolService.eliminarRol(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PERMISOS_VER')")
    @GetMapping("/permisos")
    public ResponseEntity<List<PermisoResponseDto>> listarPermisos() {
        return ResponseEntity.ok(rolService.listarTodosLosPermisos());
    }

    @PreAuthorize("@autorizacionService.tienePermiso('ROLES_ADMIN')")
    @PostMapping("/{id}/restaurar")
    public ResponseEntity<RolResponseDto> restaurarRol(@PathVariable Long id) {
        RolResponseDto response = rolService.restaurarRol(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('ROLES_ADMIN')")
    @GetMapping("/todos")
    public ResponseEntity<List<RolResponseDto>> listarTodosRoles() {
        return ResponseEntity.ok(rolService.listarTodosRoles());
    }
}

