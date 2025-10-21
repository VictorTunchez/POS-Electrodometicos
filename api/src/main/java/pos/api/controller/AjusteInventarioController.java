package pos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.inventario.ajustes.AjusteInventarioRequestDto;
import pos.api.domain.inventario.ajustes.AjusteInventarioResponseDto;
import pos.api.domain.inventario.ajustes.AjusteInventarioService;
import pos.api.domain.usuario.Usuario;

import java.util.List;

@RestController
@RequestMapping("/api/ajustes-inventario")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AjusteInventarioController {

    private final AjusteInventarioService ajusteInventarioService;

    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_VER')")
//    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_AJUSTAR')")
    @PostMapping
    public ResponseEntity<AjusteInventarioResponseDto> realizarAjuste(
            @RequestBody @Valid AjusteInventarioRequestDto dto,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(ajusteInventarioService.realizarAjuste(dto, usuario.getId()));
    }

    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_VER')")
    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<List<AjusteInventarioResponseDto>> listarAjustesPorSucursal(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(ajusteInventarioService.listarAjustesPorSucursal(sucursalId));
    }

    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_VER')")
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<AjusteInventarioResponseDto>> listarAjustesPorProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(ajusteInventarioService.listarAjustesPorProducto(productoId));
    }
}
