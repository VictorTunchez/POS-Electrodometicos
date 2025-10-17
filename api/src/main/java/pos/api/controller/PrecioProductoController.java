package pos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.listaPrecios.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/precios-producto")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PrecioProductoController {

    private final PrecioProductoService precioProductoService;

    @PreAuthorize("@autorizacionService.tienePermiso('PRECIOS_CREAR')")
    @PostMapping
    public ResponseEntity<PrecioProductoResponseDto> crearPrecio(@RequestBody @Valid PrecioProductoRequestDto dto) {
        PrecioProductoResponseDto response = precioProductoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRECIOS_VER')")
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<PrecioProductoResponseDto>> obtenerPreciosProducto(@PathVariable Long productoId) {
        List<PrecioProductoResponseDto> response = precioProductoService.obtenerPreciosPorProducto(productoId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRECIOS_VER')")
    @GetMapping("/{id}")
    public ResponseEntity<PrecioProductoResponseDto> obtenerPrecioPorId(@PathVariable Long id) {
        PrecioProductoResponseDto response = precioProductoService.obtenerPrecioPorId(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRECIOS_EDITAR')")
    @PutMapping("/{id}")
    public ResponseEntity<PrecioProductoResponseDto> actualizarPrecio(
            @PathVariable Long id,
            @RequestBody @Valid ActualizarPrecioProductoRequestDto dto) {
        PrecioProductoResponseDto response = precioProductoService.actualizar(id, dto);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRECIOS_ELIMINAR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivarPrecio(@PathVariable Long id) {
        precioProductoService.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRECIOS_VER')")
    @PostMapping("/calcular")
    public ResponseEntity<BigDecimal> calcularPrecio(@RequestBody @Valid CalcularPrecioRequestDto dto) {
        BigDecimal precio = precioProductoService.calcularPrecio(dto);
        return ResponseEntity.ok(precio);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRECIOS_CREAR')")
    @PostMapping("/generar-automaticos")
    public ResponseEntity<List<PrecioProductoResponseDto>> generarPreciosAutomaticos(
            @RequestBody @Valid GenerarPreciosAutomaticosRequestDto dto) {
        List<PrecioProductoResponseDto> response = precioProductoService.generarPreciosAutomaticos(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRECIOS_VER')")
    @GetMapping("/producto/{productoId}/unidad/{unidadMedidaId}/tipo/{tipoPrecio}")
    public ResponseEntity<PrecioProductoResponseDto> obtenerPrecioVigente(
            @PathVariable Long productoId,
            @PathVariable Long unidadMedidaId,
            @PathVariable TipoPrecio tipoPrecio) {
        PrecioProductoResponseDto response = precioProductoService.obtenerPrecioVigente(productoId, unidadMedidaId, tipoPrecio);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRECIOS_VER')")
    @GetMapping("/producto/{productoId}/margen")
    public ResponseEntity<Map<String, Object>> obtenerInformacionMargen(@PathVariable Long productoId) {
        Map<String, Object> response = precioProductoService.obtenerInformacionMargen(productoId);
        return ResponseEntity.ok(response);
    }
}
