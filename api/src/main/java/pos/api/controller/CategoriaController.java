package pos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.categoria.ActualizarCategoriaRequestDto;
import pos.api.domain.categoria.CategoriaRequestDto;
import pos.api.domain.categoria.CategoriaResponseDto;
import pos.api.domain.categoria.CategoriaService;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategoriaController {

    private final CategoriaService categoriaService;

    @PreAuthorize("@autorizacionService.tienePermiso('CATEGORIAS_CREAR')")
    @PostMapping
    public ResponseEntity<CategoriaResponseDto> crearCategoria(@RequestBody @Valid CategoriaRequestDto dto) {
        CategoriaResponseDto response = categoriaService.crearCategoria(dto);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('CATEGORIAS_VER')")
    @GetMapping
    public ResponseEntity<List<CategoriaResponseDto>> listarCategorias() {
        List<CategoriaResponseDto> response = categoriaService.listarCategorias();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('CATEGORIAS_VER')")
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponseDto> obtenerCategoria(@PathVariable Long id) {
        CategoriaResponseDto response = categoriaService.obtenerCategoria(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('CATEGORIAS_EDITAR')")
    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponseDto> actualizarCategoria(@PathVariable Long id,
                                                                    @RequestBody @Valid ActualizarCategoriaRequestDto dto) {
        CategoriaResponseDto response = categoriaService.actualizarCategoria(id, dto);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('CATEGORIAS_ELIMINAR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCategoria(@PathVariable Long id) {
        categoriaService.eliminarCategoria(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('CATEGORIAS_ADMIN')")
    @PostMapping("/{id}/restaurar")
    public ResponseEntity<Void> restaurarCategoria(@PathVariable Long id) {
        categoriaService.restaurarCategoria(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('CATEGORIAS_ADMIN')")
    @GetMapping("/todos")
    public ResponseEntity<List<CategoriaResponseDto>> listarTodasCategorias() {
        List<CategoriaResponseDto> response = categoriaService.listarTodasCategorias();
        return ResponseEntity.ok(response);
    }
}