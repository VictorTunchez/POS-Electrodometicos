package pos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.unidadMedida.*;
import java.util.List;

@RestController
@RequestMapping("/api/unidades-medida")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UnidadMedidaController {

    private final UnidadMedidaService unidadMedidaService;

    @PreAuthorize("@autorizacionService.tienePermiso('UNIDADES_MEDIDA_CREAR')")
    @PostMapping
    public ResponseEntity<UnidadMedidaResponseDto> crearUnidadMedida(@RequestBody @Valid UnidadMedidaRequestDto dto) {
        UnidadMedidaResponseDto response = unidadMedidaService.crear(dto);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('UNIDADES_MEDIDA_VER')")
    @GetMapping
    public ResponseEntity<List<UnidadMedidaResponseDto>> listarUnidadesMedidaActivas() {
        List<UnidadMedidaResponseDto> response = unidadMedidaService.listarActivas();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('UNIDADES_MEDIDA_VER')")
    @GetMapping("/{id}")
    public ResponseEntity<UnidadMedidaResponseDto> obtenerUnidadMedida(@PathVariable Long id) {
        UnidadMedidaResponseDto response = unidadMedidaService.obtenerPorId(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('UNIDADES_MEDIDA_EDITAR')")
    @PutMapping("/{id}")
    public ResponseEntity<UnidadMedidaResponseDto> actualizarUnidadMedida(
            @PathVariable Long id,
            @RequestBody @Valid ActualizarUnidadMedidaRequestDto dto) {
        UnidadMedidaResponseDto response = unidadMedidaService.actualizar(id, dto);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('UNIDADES_MEDIDA_ELIMINAR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUnidadMedida(@PathVariable Long id) {
        unidadMedidaService.eliminarLogico(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('UNIDADES_MEDIDA_ADMIN')")
    @PostMapping("/{id}/restaurar")
    public ResponseEntity<Void> restaurarUnidadMedida(@PathVariable Long id) {
        unidadMedidaService.restaurar(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('UNIDADES_MEDIDA_VER')")
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<UnidadMedidaResponseDto>> listarUnidadesMedidaPorTipo(@PathVariable TipoUnidad tipo) {
        List<UnidadMedidaResponseDto> response = unidadMedidaService.listarPorTipo(tipo);
        return ResponseEntity.ok(response);
    }
}
