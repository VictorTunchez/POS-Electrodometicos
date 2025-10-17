package pos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.compra.CompraResponseDto;
import pos.api.domain.proveedor.ActualizarProveedorRequestDto;
import pos.api.domain.proveedor.ProveedorRequestDto;
import pos.api.domain.proveedor.ProveedorResponseDto;
import pos.api.domain.proveedor.ProveedorService;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Validated
public class ProveedorController {

    private final ProveedorService proveedorService;

    @PreAuthorize("@autorizacionService.tienePermiso('PROVEEDORES_CREAR')")
    @PostMapping
    public ResponseEntity<ProveedorResponseDto> crearProveedor(@RequestBody @Valid ProveedorRequestDto dto) {
        ProveedorResponseDto response = proveedorService.crearProveedor(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PROVEEDORES_VER')")
    @GetMapping
    public ResponseEntity<List<ProveedorResponseDto>> listarProveedores() {
        List<ProveedorResponseDto> response = proveedorService.listarProveedoresActivos();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PROVEEDORES_VER')")
    @GetMapping("/{id}")
    public ResponseEntity<ProveedorResponseDto> obtenerProveedor(@PathVariable Long id) {
        ProveedorResponseDto response = proveedorService.obtenerProveedor(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PROVEEDORES_EDITAR')")
    @PutMapping("/{id}")
    public ResponseEntity<ProveedorResponseDto> actualizarProveedor(
            @PathVariable Long id,
            @RequestBody @Valid ActualizarProveedorRequestDto dto) {
        ProveedorResponseDto response = proveedorService.actualizarProveedor(id, dto);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PROVEEDORES_ELIMINAR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProveedor(@PathVariable Long id) {
        proveedorService.eliminarProveedor(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PROVEEDORES_VER')")
    @GetMapping("/buscar")
    public ResponseEntity<List<ProveedorResponseDto>> buscarProveedores(
            @RequestParam(required = false) String razonSocial,
            @RequestParam(required = false) String ruc) {
        List<ProveedorResponseDto> response = proveedorService.buscarProveedores(razonSocial, ruc);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PROVEEDORES_ADMIN')")
    @PostMapping("/{id}/restaurar")
    public ResponseEntity<Void> restaurarProveedor(@PathVariable Long id) {
        proveedorService.restaurarProveedor(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PROVEEDORES_VER')")
    @GetMapping("/{id}/compras")
    public ResponseEntity<List<CompraResponseDto>> obtenerComprasPorProveedor(@PathVariable Long id) {
        List<CompraResponseDto> response = proveedorService.obtenerComprasPorProveedor(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PROVEEDORES_VER')")
    @GetMapping("/todos")
    public ResponseEntity<List<ProveedorResponseDto>> listarTodosProveedores() {
        List<ProveedorResponseDto> response = proveedorService.listarTodosProveedores();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PROVEEDORES_VER')")
    @GetMapping("/inactivos")
    public ResponseEntity<List<ProveedorResponseDto>> listarProveedoresInactivos() {
        List<ProveedorResponseDto> response = proveedorService.listarProveedoresInactivos();
        return ResponseEntity.ok(response);
    }
}