package pos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.tarjetaRegalo.ActualizarTarjetaRegaloRequestDto;
import pos.api.domain.tarjetaRegalo.TarjetaRegaloRequestDto;
import pos.api.domain.tarjetaRegalo.TarjetaRegaloResponseDto;
import pos.api.domain.tarjetaRegalo.TarjetaRegaloService;

import java.util.List;

@RestController
@RequestMapping("/api/tarjetas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TarjetaRegaloController {

    private final TarjetaRegaloService tarjetaService;

    @PreAuthorize("@autorizacionService.tienePermiso('TARJETAS_CREAR')")
    @PostMapping
    public ResponseEntity<TarjetaRegaloResponseDto> crear(@RequestBody @Valid TarjetaRegaloRequestDto dto) {
        return ResponseEntity.ok(tarjetaService.crear(dto));
    }

    @PreAuthorize("@autorizacionService.tienePermiso('TARJETAS_VER')")
    @GetMapping
    public ResponseEntity<List<TarjetaRegaloResponseDto>> listar() {
        return ResponseEntity.ok(tarjetaService.listar());
    }

    @PreAuthorize("@autorizacionService.tienePermiso('TARJETAS_VER')")
    @GetMapping("/{id}")
    public ResponseEntity<TarjetaRegaloResponseDto> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(tarjetaService.obtener(id));
    }

    @PreAuthorize("@autorizacionService.tienePermiso('TARJETAS_EDITAR')")
    @PutMapping("/{id}")
    public ResponseEntity<TarjetaRegaloResponseDto> actualizar(@PathVariable Long id,
                                                               @RequestBody @Valid ActualizarTarjetaRegaloRequestDto dto) {
        return ResponseEntity.ok(tarjetaService.actualizar(id, dto));
    }

    @PreAuthorize("@autorizacionService.tienePermiso('TARJETAS_ELIMINAR')")
    @PostMapping("/{id}/anular")
    public ResponseEntity<Void> anular(@PathVariable Long id) {
        tarjetaService.anular(id);
        return ResponseEntity.noContent().build();
    }
}

