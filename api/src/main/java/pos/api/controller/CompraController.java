package pos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.compra.*;
import pos.api.domain.usuario.Usuario;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compras")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Validated
public class CompraController {

    private final CompraService compraService;

    @PreAuthorize("@autorizacionService.tienePermiso('COMPRAS_CREAR')")
    @PostMapping
    public ResponseEntity<CompraResponseDto> registrarCompra(
            @RequestBody @Valid CompraRequestDto dto,
            @AuthenticationPrincipal Usuario usuario) { // AÑADIR ESTE PARÁMETRO

        CompraResponseDto response = compraService.registrarCompra(dto, usuario.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // MÉTODOS MODIFICADOS - CON @AuthenticationPrincipal
    @PreAuthorize("@autorizacionService.tienePermiso('COMPRAS_EDITAR')")
    @PostMapping("/{id}/recibir")
    public ResponseEntity<CompraResponseDto> recibirCompra(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) { // Spring inyecta el usuario automáticamente

        CompraResponseDto response = compraService.recibirCompra(id, usuario.getId());
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('COMPRAS_EDITAR')")
    @PostMapping("/{id}/recibir-parcial")
    public ResponseEntity<CompraResponseDto> recibirCompraParcial(
            @PathVariable Long id,
            @RequestBody @Valid List<DetalleRecepcionRequestDto> detallesRecepcion,
            @AuthenticationPrincipal Usuario usuario) {

        CompraResponseDto response = compraService.recibirCompraParcial(id, detallesRecepcion, usuario.getId());
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('COMPRAS_EDITAR')")
    @PostMapping("/{id}/cancelar")
    public ResponseEntity<CompraResponseDto> cancelarCompra(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {

        CompraResponseDto response = compraService.cancelarCompra(id, usuario.getId());
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('COMPRAS_VER')")
    @GetMapping
    public ResponseEntity<List<CompraResponseDto>> listarCompras() {
        List<CompraResponseDto> response = compraService.listarCompras();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('COMPRAS_VER')")
    @GetMapping("/{id}")
    public ResponseEntity<CompraResponseDto> obtenerCompra(@PathVariable Long id) {
        CompraResponseDto response = compraService.obtenerCompra(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('COMPRAS_VER')")
    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<List<CompraResponseDto>> listarComprasPorSucursal(@PathVariable Long sucursalId) {
        List<CompraResponseDto> response = compraService.listarComprasPorSucursal(sucursalId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('COMPRAS_VER')")
    @GetMapping("/proveedor/{proveedorId}")
    public ResponseEntity<List<CompraResponseDto>> listarComprasPorProveedor(@PathVariable Long proveedorId) {
        List<CompraResponseDto> response = compraService.listarComprasPorProveedor(proveedorId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('COMPRAS_VER')")
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<CompraResponseDto>> listarComprasPorEstado(@PathVariable EstadoCompra estado) {
        List<CompraResponseDto> response = compraService.listarComprasPorEstado(estado);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('COMPRAS_VER')")
    @GetMapping("/rango-fechas")
    public ResponseEntity<List<CompraResponseDto>> listarComprasPorRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant fechaFin) {
        List<CompraResponseDto> response = compraService.listarComprasPorRangoFechas(fechaInicio, fechaFin);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('COMPRAS_VER')")
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<CompraResponseDto>> listarComprasPorProducto(@PathVariable Long productoId) {
        List<CompraResponseDto> response = compraService.listarComprasPorProducto(productoId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('COMPRAS_EDITAR')")
    @PutMapping("/{id}")
    public ResponseEntity<CompraResponseDto> actualizarCompra(
            @PathVariable Long id,
            @RequestBody @Valid ActualizarCompraRequestDto dto) {
        CompraResponseDto response = compraService.actualizarCompra(id, dto);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('COMPRAS_ELIMINAR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCompra(@PathVariable Long id) {
        compraService.eliminarCompra(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('COMPRAS_VER')")
    @GetMapping("/{id}/detalles")
    public ResponseEntity<List<DetalleCompraResponseDto>> obtenerDetallesCompra(@PathVariable Long id) {
        List<DetalleCompraResponseDto> response = compraService.obtenerDetallesCompra(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('COMPRAS_VER')")
    @GetMapping("/resumen-mensual")
    public ResponseEntity<Map<String, Object>> obtenerResumenComprasMensual(
            @RequestParam int año,
            @RequestParam int mes) {
        Map<String, Object> response = compraService.obtenerResumenComprasMensual(año, mes);
        return ResponseEntity.ok(response);
    }
}
