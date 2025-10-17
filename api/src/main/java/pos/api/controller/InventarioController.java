package pos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.inventario.InventarioRequestDto;
import pos.api.domain.inventario.InventarioResponseDto;
import pos.api.domain.inventario.InventarioService;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventarioController {

    private final InventarioService inventarioService;

    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_CREAR')")
    @PostMapping
    public ResponseEntity<InventarioResponseDto> crearInventario(@RequestBody @Valid InventarioRequestDto dto) {
        return ResponseEntity.ok(inventarioService.crearRegistroInventario(dto));
    }

    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_VER')")
    @GetMapping
    public ResponseEntity<List<InventarioResponseDto>> listarInventario() {
        return ResponseEntity.ok(inventarioService.listarInventarioCompleto());
    }

    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_VER')")
    @GetMapping("/{id}")
    public ResponseEntity<InventarioResponseDto> obtenerInventarioPorId(@PathVariable Long id) {
        return ResponseEntity.ok(inventarioService.obtenerInventarioPorId(id));
    }

    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_VER')")
    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<List<InventarioResponseDto>> listarInventarioPorSucursal(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(inventarioService.listarInventarioPorSucursal(sucursalId));
    }

    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_VER')")
    @GetMapping("/producto/{productoId}/sucursal/{sucursalId}")
    public ResponseEntity<InventarioResponseDto> obtenerInventario(@PathVariable Long productoId, @PathVariable Long sucursalId) {
        return ResponseEntity.ok(inventarioService.obtenerInventario(productoId, sucursalId));
    }

    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_EDITAR')")
    @PutMapping("/{id}")
    public ResponseEntity<InventarioResponseDto> actualizarInventario(@PathVariable Long id,
                                                                      @RequestBody @Valid InventarioRequestDto dto) {
        return ResponseEntity.ok(inventarioService.actualizarInventario(id, dto));
    }

    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_ELIMINAR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarInventario(@PathVariable Long id) {
        inventarioService.eliminarInventario(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_VER')")
    @GetMapping("/stock-bajo")
    public ResponseEntity<List<InventarioResponseDto>> listarProductosConStockBajo() {
        return ResponseEntity.ok(inventarioService.listarProductosConStockBajo());
    }

}