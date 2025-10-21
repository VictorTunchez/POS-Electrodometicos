package pos.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.inventario.movimientos.MovimientoInventarioResponseDto;
import pos.api.domain.inventario.movimientos.MovimientoInventarioService;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/movimientos-inventario")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MovimientoInventarioController {

    private final MovimientoInventarioService movimientoInventarioService;

    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_VER')")
//    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_VER_MOVIMIENTOS')")
    @GetMapping("/producto/{productoId}/sucursal/{sucursalId}")
    public ResponseEntity<List<MovimientoInventarioResponseDto>> obtenerMovimientos(
            @PathVariable Long productoId,
            @PathVariable Long sucursalId) {
        return ResponseEntity.ok(
                movimientoInventarioService.obtenerMovimientosPorProductoYSucursal(productoId, sucursalId)
        );
    }

//    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_VER_MOVIMIENTOS')")
    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_VER')")
    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<List<MovimientoInventarioResponseDto>> obtenerMovimientosPorSucursal(
            @PathVariable Long sucursalId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant hasta) {
        return ResponseEntity.ok(
                movimientoInventarioService.obtenerMovimientosPorSucursal(sucursalId, desde, hasta)
        );
    }

    @PreAuthorize("@autorizacionService.tienePermiso('INVENTARIO_VER')")
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<MovimientoInventarioResponseDto>> obtenerMovimientosPorProducto(
            @PathVariable Long productoId) {
        return ResponseEntity.ok(
                movimientoInventarioService.obtenerMovimientosPorProducto(productoId)
        );
    }
}