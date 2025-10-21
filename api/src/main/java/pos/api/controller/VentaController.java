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
import pos.api.domain.usuario.Usuario;
import pos.api.domain.venta.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Validated
public class VentaController {

    private final VentaService ventaService;
    private final PdfGeneratorService pdfGeneratorService;

    @PreAuthorize("@autorizacionService.tienePermiso('VENTAS_CREAR')")
    @PostMapping
    public ResponseEntity<VentaResponseDto> crearVenta(
            @RequestBody @Valid VentaRequestDto dto,
            @AuthenticationPrincipal Usuario usuario) { // AÑADIR AuthenticationPrincipal

        VentaResponseDto response = ventaService.crearVenta(dto, usuario.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('VENTAS_EDITAR')")
    @PostMapping("/{id}/cancelar")
    public ResponseEntity<VentaResponseDto> cancelarVenta(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) { // AÑADIR AuthenticationPrincipal

        VentaResponseDto response = ventaService.cancelarVenta(id, usuario.getId());
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('VENTAS_VER')")
    @GetMapping
    public ResponseEntity<List<VentaResponseDto>> listarVentas() {
        List<VentaResponseDto> response = ventaService.listarVentas();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('VENTAS_VER')")
    @GetMapping("/{id}")
    public ResponseEntity<VentaResponseDto> obtenerVenta(@PathVariable Long id) {
        VentaResponseDto response = ventaService.obtenerVenta(id);
        return ResponseEntity.ok(response);
    }


    @PreAuthorize("@autorizacionService.tienePermiso('VENTAS_VER')")
    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<List<VentaResponseDto>> listarVentasPorSucursal(@PathVariable Long sucursalId) {
        List<VentaResponseDto> response = ventaService.listarVentasPorSucursal(sucursalId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('VENTAS_VER')")
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<VentaResponseDto>> listarVentasPorCliente(@PathVariable Long clienteId) {
        List<VentaResponseDto> response = ventaService.listarVentasPorCliente(clienteId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('VENTAS_VER')")
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<VentaResponseDto>> listarVentasPorEstado(@PathVariable EstadoVenta estado) {
        List<VentaResponseDto> response = ventaService.listarVentasPorEstado(estado);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('VENTAS_VER')")
    @GetMapping("/rango-fechas")
    public ResponseEntity<List<VentaResponseDto>> listarVentasPorRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant fechaFin) {
        List<VentaResponseDto> response = ventaService.listarVentasPorRangoFechas(fechaInicio, fechaFin);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('VENTAS_VER')")
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<VentaResponseDto>> listarVentasPorUsuario(@PathVariable Long usuarioId) {
        List<VentaResponseDto> response = ventaService.listarVentasPorUsuario(usuarioId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('VENTAS_VER')")
    @GetMapping("/{id}/detalles")
    public ResponseEntity<List<DetalleVentaResponseDto>> obtenerDetallesVenta(@PathVariable Long id) {
        List<DetalleVentaResponseDto> response = ventaService.obtenerDetallesVenta(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('VENTAS_EDITAR')")
    @PutMapping("/{id}")
    public ResponseEntity<VentaResponseDto> actualizarVenta(
            @PathVariable Long id,
            @RequestBody @Valid ActualizarVentaRequestDto dto) {
        VentaResponseDto response = ventaService.actualizarVenta(id, dto);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('VENTAS_ELIMINAR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarVenta(@PathVariable Long id) {
        ventaService.eliminarVenta(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('VENTAS_VER')")
    @GetMapping("/resumen-mensual")
    public ResponseEntity<Map<String, Object>> obtenerResumenVentasMensual(
            @RequestParam int año,
            @RequestParam int mes) {
        Map<String, Object> response = ventaService.obtenerResumenVentasMensual(año, mes);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('VENTAS_VER')")
    @GetMapping("/{id}/factura-pdf")
    public ResponseEntity<byte[]> descargarFacturaPdf(@PathVariable Long id) {
        Venta venta = ventaService.obtenerVentaEntity(id);
        byte[] pdf = pdfGeneratorService.generarFacturaPdf(venta);

        String filename = "factura-" + venta.getNumeroFactura() + ".pdf";

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(pdf);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('VENTAS_VER')")
    @GetMapping("/{id}/ticket-pdf")
    public ResponseEntity<byte[]> descargarTicketPdf(@PathVariable Long id) {
        Venta venta = ventaService.obtenerVentaEntity(id);
        byte[] pdf = pdfGeneratorService.generarTicketPdf(venta);

        String filename = "ticket-" + venta.getNumeroFactura() + ".pdf";

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(pdf);
    }

}