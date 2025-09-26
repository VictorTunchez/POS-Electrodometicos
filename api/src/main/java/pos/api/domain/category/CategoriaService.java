package pos.api.domain.category;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoriaService {

    private final ICategoriaRepository categoriaRepository;

    @Transactional
    public CategoriaResponseDto crearCategoria(CategoriaRequestDto dto) {
        if (categoriaRepository.existsByNombreCategoriaAndDeletedAtIsNull(dto.nombreCategoria())) {
            throw new IllegalStateException("Ya existe una categoría con el nombre: " + dto.nombreCategoria());
        }

        Categoria categoria = new Categoria();
        categoria.setNombreCategoria(dto.nombreCategoria());
        categoria.setDescripcion(dto.descripcion());

        // Imagen opcional - solo establecer si se proporciona
        if (dto.imagen() != null && !dto.imagen().isBlank()) {
            categoria.setImagen(dto.imagen());
        }

        Categoria guardada = categoriaRepository.save(categoria);
        return mapToResponse(guardada);
    }

    public List<CategoriaResponseDto> listarCategorias() {
        return categoriaRepository.findByDeletedAtIsNull().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CategoriaResponseDto obtenerCategoria(Long id) {
        Categoria categoria = categoriaRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada con ID: " + id));
        return mapToResponse(categoria);
    }

    @Transactional
    public CategoriaResponseDto actualizarCategoria(Long id, ActualizarCategoriaRequestDto dto) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada con ID: " + id));

        if (categoriaRepository.existsByNombreCategoriaAndIdNotAndDeletedAtIsNull(dto.nombreCategoria(), id)) {
            throw new IllegalStateException("Ya existe una categoría con el nombre: " + dto.nombreCategoria());
        }

        categoria.setNombreCategoria(dto.nombreCategoria());
        categoria.setDescripcion(dto.descripcion());

        // Imagen opcional - solo actualizar si se proporciona un valor
        if (dto.imagen() != null) {
            categoria.setImagen(dto.imagen().isBlank() ? null : dto.imagen());
        }

        Categoria actualizada = categoriaRepository.save(categoria);
        return mapToResponse(actualizada);
    }

    @Transactional
    public void eliminarCategoria(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada con ID: " + id));

        // Verificar si tiene productos asociados
        Integer cantidadProductos = categoriaRepository.countProductosActivosByCategoriaId(id);
        if (cantidadProductos > 0) {
            throw new IllegalStateException("No se puede eliminar la categoría porque tiene " + cantidadProductos + " productos asociados");
        }

        categoria.setDeletedAt(Instant.now());
        categoriaRepository.save(categoria);
    }

    @Transactional
    public void restaurarCategoria(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada con ID: " + id));

        categoria.setDeletedAt(null);
        categoriaRepository.save(categoria);
    }

    public List<CategoriaResponseDto> listarTodasCategorias() {
        return categoriaRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    private CategoriaResponseDto mapToResponse(Categoria categoria) {
        Integer cantidadProductos = categoriaRepository.countProductosActivosByCategoriaId(categoria.getId());

        return new CategoriaResponseDto(
                categoria.getId(),
                categoria.getNombreCategoria(),
                categoria.getDescripcion(),
                categoria.getImagen(),
                categoria.getCreatedAt(),
                categoria.getUpdatedAt(),
                categoria.getDeletedAt(),
                cantidadProductos
        );
    }
}