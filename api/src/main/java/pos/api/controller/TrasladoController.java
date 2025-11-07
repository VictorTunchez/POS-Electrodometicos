package pos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.inventario.traslados.EstadoTraslado;
import pos.api.domain.inventario.traslados.TrasladoRequestDto;
import pos.api.domain.inventario.traslados.TrasladoResponseDto;
import pos.api.domain.inventario.traslados.TrasladoService;
import pos.api.domain.usuario.Usuario;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/traslados")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Validated
public class TrasladoController {

    private final TrasladoService trasladoService;

    @PostMapping
    public ResponseEntity<TrasladoResponseDto> crearTraslado(@RequestBody @Valid TrasladoRequestDto dto,
                                                             @AuthenticationPrincipal Usuario usuario) {
        TrasladoResponseDto response = trasladoService.crearTraslado(dto, usuario.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/completar")
    public ResponseEntity<TrasladoResponseDto> completarTraslado(@PathVariable Long id,
                                                                 @AuthenticationPrincipal Usuario usuario) {
        TrasladoResponseDto response = trasladoService.completarTraslado(id, usuario.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<TrasladoResponseDto> cancelarTraslado(@PathVariable Long id,
                                                                @AuthenticationPrincipal Usuario usuario) {
        TrasladoResponseDto response = trasladoService.cancelarTraslado(id, usuario.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/rechazar")
    public ResponseEntity<TrasladoResponseDto> rechazarTraslado(@PathVariable Long id,
                                                                @RequestBody Map<String, String> request,
                                                                @AuthenticationPrincipal Usuario usuario) {
        String motivo = request.get("motivo");
        TrasladoResponseDto response = trasladoService.rechazarTraslado(id, usuario.getId(), motivo);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TrasladoResponseDto>> listarTraslados() {
        return ResponseEntity.ok(trasladoService.listarTraslados());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrasladoResponseDto> obtenerTraslado(@PathVariable Long id) {
        return ResponseEntity.ok(trasladoService.obtenerTraslado(id));
    }

    @GetMapping("/sucursal-origen/{sucursalOrigenId}")
    public ResponseEntity<List<TrasladoResponseDto>> listarTrasladosPorSucursalOrigen(@PathVariable Long sucursalOrigenId) {
        return ResponseEntity.ok(trasladoService.listarTrasladosPorSucursalOrigen(sucursalOrigenId));
    }

    @GetMapping("/sucursal-destino/{sucursalDestinoId}")
    public ResponseEntity<List<TrasladoResponseDto>> listarTrasladosPorSucursalDestino(@PathVariable Long sucursalDestinoId) {
        return ResponseEntity.ok(trasladoService.listarTrasladosPorSucursalDestino(sucursalDestinoId));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<TrasladoResponseDto>> listarTrasladosPorEstado(@PathVariable EstadoTraslado estado) {
        return ResponseEntity.ok(trasladoService.listarTrasladosPorEstado(estado));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<TrasladoResponseDto>> listarTrasladosPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(trasladoService.listarTrasladosPorUsuario(usuarioId));
    }
}
