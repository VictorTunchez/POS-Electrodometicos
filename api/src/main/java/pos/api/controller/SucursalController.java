package pos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.sucursal.SucursalRequestDto;
import pos.api.domain.sucursal.SucursalResponseDto;
import pos.api.domain.sucursal.SucursalService;

import java.util.List;

@RestController
@RequestMapping("/api/sucursales")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SucursalController {

    private final SucursalService sucursalService;

    @PreAuthorize("@autorizacionService.tienePermiso('SUCURSALES_CREAR')")
    @PostMapping
    public ResponseEntity<SucursalResponseDto> crearSucursal(@RequestBody @Valid SucursalRequestDto dto) {
        SucursalResponseDto response = sucursalService.crearSucursal(dto);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('SUCURSALES_VER')")
    @GetMapping
    public ResponseEntity<List<SucursalResponseDto>> listarSucursales() {
        List<SucursalResponseDto> response = sucursalService.listarSucursales();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('SUCURSALES_VER')")
    @GetMapping("/{id}")
    public ResponseEntity<SucursalResponseDto> obtenerSucursal(@PathVariable Long id) {
        SucursalResponseDto response = sucursalService.obtenerSucursal(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('SUCURSALES_EDITAR')")
    @PutMapping("/{id}")
    public ResponseEntity<SucursalResponseDto> actualizarSucursal(@PathVariable Long id,
                                                                  @RequestBody @Valid SucursalRequestDto dto) {
        SucursalResponseDto response = sucursalService.actualizarSucursal(id, dto);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('SUCURSALES_ELIMINAR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSucursal(@PathVariable Long id) {
        sucursalService.eliminarSucursal(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('SUCURSALES_ADMIN')")
    @PostMapping("/{id}/restaurar")
    public ResponseEntity<Void> restaurarSucursal(@PathVariable Long id) {
        sucursalService.restaurarSucursal(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('SUCURSALES_ADMIN')")
    @GetMapping("/todos")
    public ResponseEntity<List<SucursalResponseDto>> listarTodasSucursales() {
        List<SucursalResponseDto> response = sucursalService.listarTodasSucursales();
        return ResponseEntity.ok(response);
    }
}

