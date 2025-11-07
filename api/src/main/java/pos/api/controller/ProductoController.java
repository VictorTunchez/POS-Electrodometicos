package pos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.producto.ActualizarProductoRequestDto;
import pos.api.domain.producto.ProductoRequestDto;
import pos.api.domain.producto.ProductoResponseDto;
import pos.api.domain.producto.ProductoService;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoService productoService;

    @PreAuthorize("@autorizacionService.tienePermiso('PRODUCTOS_CREAR')")
    @PostMapping
    public ResponseEntity<ProductoResponseDto> crearProducto(@RequestBody @Valid ProductoRequestDto dto) {
        ProductoResponseDto response = productoService.crearProducto(dto);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRODUCTOS_VER')")
    @GetMapping
    public ResponseEntity<List<ProductoResponseDto>> listarProductos() {
        List<ProductoResponseDto> response = productoService.listarProductos();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRODUCTOS_VER')")
    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponseDto> obtenerProducto(@PathVariable Long id) {
        ProductoResponseDto response = productoService.obtenerProducto(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRODUCTOS_EDITAR')")
    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponseDto> actualizarProducto(@PathVariable Long id,
                                                                  @RequestBody @Valid ActualizarProductoRequestDto dto) {
        ProductoResponseDto response = productoService.actualizarProducto(id, dto);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRODUCTOS_ELIMINAR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRODUCTOS_ADMIN')")
    @PostMapping("/{id}/restaurar")
    public ResponseEntity<Void> restaurarProducto(@PathVariable Long id) {
        productoService.restaurarProducto(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRODUCTOS_ADMIN')")
    @GetMapping("/todos")
    public ResponseEntity<List<ProductoResponseDto>> listarTodosProductos() {
        List<ProductoResponseDto> response = productoService.listarTodosProductos();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRODUCTOS_VER')")
    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<ProductoResponseDto>> listarProductosPorCategoria(@PathVariable Long categoriaId) {
        List<ProductoResponseDto> response = productoService.listarProductosPorCategoria(categoriaId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('PRODUCTOS_VER')")
    @GetMapping("/destacados")
    public ResponseEntity<List<ProductoResponseDto>> listarProductosDestacados() {
        List<ProductoResponseDto> response = productoService.listarProductosDestacados();
        return ResponseEntity.ok(response);
    }

    // Nuevo enpoint opcional
    @PreAuthorize("@autorizacionService.tienePermiso('PRODUCTOS_VER')")
    @GetMapping("/unidad-medida/{unidadMedidaId}")
    public ResponseEntity<List<ProductoResponseDto>> listarProductosPorUnidadMedida(@PathVariable Long unidadMedidaId) {
        List<ProductoResponseDto> response = productoService.listarProductosPorUnidadMedida(unidadMedidaId);
        return ResponseEntity.ok(response);
    }

//    @PreAuthorize("@autorizacionService.tienePermiso('PRODUCTOS_VER')")
//    @GetMapping("/estado/{estado}")
//    public ResponseEntity<List<ProductoResponseDto>> listarProductosPorEstado(@PathVariable String estado) {
//        List<ProductoResponseDto> response = productoService.listarProductosPorEstado(estado);
//        return ResponseEntity.ok(response);
//    }
}