package pos.api.domain.product;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pos.api.domain.category.Categoria;
import pos.api.domain.category.ICategoriaRepository;
import pos.api.domain.inventario.IInventarioRepository;
import pos.api.domain.inventario.Inventario;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductoService {

    private final IProductoRepository productoRepository;
    private final ICategoriaRepository categoriaRepository;
    private final IInventarioRepository inventarioRepository;

    public ProductoResponseDto crearProducto(ProductoRequestDto dto) {
        // Validar que el código de barras sea único (si se proporciona)
        if (dto.codigoBarras() != null && !dto.codigoBarras().isBlank()) {
            if (productoRepository.existsByCodigoBarrasAndDeletedAtIsNull(dto.codigoBarras())) {
                throw new IllegalStateException("Ya existe un producto con el código de barras: " + dto.codigoBarras());
            }
        }

        // Validar que el nombre sea único
        if (productoRepository.existsByNombreProductoAndDeletedAtIsNull(dto.nombreProducto())) {
            throw new IllegalStateException("Ya existe un producto con el nombre: " + dto.nombreProducto());
        }

        // Validar que la categoría exista
        Categoria categoria = categoriaRepository.findByIdAndDeletedAtIsNull(dto.categoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada con ID: " + dto.categoriaId()));

        // Validar que el precio de venta sea mayor al precio de compra
        if (dto.precioVenta().compareTo(dto.precioCompra()) <= 0) {
            throw new IllegalArgumentException("El precio de venta debe ser mayor al precio de compra");
        }

        Producto producto = new Producto();
        producto.setNombreProducto(dto.nombreProducto());
        producto.setCodigoBarras(dto.codigoBarras());
        producto.setDescripcion(dto.descripcion());
        producto.setPrecioCompra(dto.precioCompra());
        producto.setPrecioVenta(dto.precioVenta());

        // Imagen opcional
        if (dto.imagen() != null && !dto.imagen().isBlank()) {
            producto.setImagen(dto.imagen());
        }

        producto.setCategoria(categoria);
//        producto.setEstado(dto.estado() != null ? dto.estado() : "activo");
        producto.setDestacado(dto.destacado() != null ? dto.destacado() : false);

        Producto guardado = productoRepository.save(producto);
        return mapToResponse(guardado);
    }

    public List<ProductoResponseDto> listarProductos() {
        return productoRepository.findByDeletedAtIsNull().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ProductoResponseDto obtenerProducto(Long id) {
        Producto producto = productoRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + id));
        return mapToResponse(producto);
    }

    @Transactional
    public ProductoResponseDto actualizarProducto(Long id, ActualizarProductoRequestDto dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + id));

        // Validar código de barras único (si se proporciona y ha cambiado)
        if (dto.codigoBarras() != null && !dto.codigoBarras().isBlank()
                && !dto.codigoBarras().equals(producto.getCodigoBarras())) {
            if (productoRepository.existsByCodigoBarrasAndIdNotAndDeletedAtIsNull(dto.codigoBarras(), id)) {
                throw new IllegalStateException("Ya existe un producto con el código de barras: " + dto.codigoBarras());
            }
        }

        // Validar nombre único (si ha cambiado)
        if (!dto.nombreProducto().equals(producto.getNombreProducto())) {
            if (productoRepository.existsByNombreProductoAndIdNotAndDeletedAtIsNull(dto.nombreProducto(), id)) {
                throw new IllegalStateException("Ya existe un producto con el nombre: " + dto.nombreProducto());
            }
        }

        // Validar categoría
        Categoria categoria = categoriaRepository.findByIdAndDeletedAtIsNull(dto.categoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada con ID: " + dto.categoriaId()));

        // Validar que el precio de venta sea mayor al precio de compra
        if (dto.precioVenta().compareTo(dto.precioCompra()) <= 0) {
            throw new IllegalArgumentException("El precio de venta debe ser mayor al precio de compra");
        }

        producto.setNombreProducto(dto.nombreProducto());
        producto.setCodigoBarras(dto.codigoBarras());
        producto.setDescripcion(dto.descripcion());
        producto.setPrecioCompra(dto.precioCompra());
        producto.setPrecioVenta(dto.precioVenta());

        // Imagen opcional
        if (dto.imagen() != null) {
            producto.setImagen(dto.imagen().isBlank() ? null : dto.imagen());
        }

        producto.setCategoria(categoria);
//        producto.setEstado(dto.estado());
        producto.setDestacado(dto.destacado());

        Producto actualizado = productoRepository.save(producto);
        return mapToResponse(actualizado);
    }

    @Transactional
    public void eliminarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + id));

        List<Inventario> inventarios = inventarioRepository.findByProductoId(id);
        if (!inventarios.isEmpty()) {
            throw new IllegalStateException("No se puede eliminar el producto porque tiene inventario registrado");
        }
        producto.setDeletedAt(Instant.now());
        productoRepository.save(producto);
    }

    @Transactional
    public void restaurarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + id));

        producto.setDeletedAt(null);
        productoRepository.save(producto);
    }

    public List<ProductoResponseDto> listarTodosProductos() {
        return productoRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ProductoResponseDto> listarProductosPorCategoria(Long categoriaId) {
        return productoRepository.findByCategoriaIdAndDeletedAtIsNull(categoriaId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ProductoResponseDto> listarProductosDestacados() {
        return productoRepository.findByDestacadoAndDeletedAtIsNull(true).stream()
                .map(this::mapToResponse)
                .toList();
    }

//    public List<ProductoResponseDto> listarProductosPorEstado(String estado) {
//        return productoRepository.findByEstadoAndDeletedAtIsNull(estado).stream()
//                .map(this::mapToResponse)
//                .toList();
//    }

    private ProductoResponseDto mapToResponse(Producto producto) {
        return new ProductoResponseDto(
                producto.getId(),
                producto.getCodigoBarras(),
                producto.getNombreProducto(),
                producto.getDescripcion(),
                producto.getPrecioCompra(),
                producto.getPrecioVenta(),
                producto.getImagen(),
                producto.getCategoria() != null ? producto.getCategoria().getId() : null,
                producto.getCategoria() != null ? producto.getCategoria().getNombreCategoria() : null,
//                producto.getEstado(),
                producto.getDestacado(),
                producto.getCreatedAt(),
                producto.getUpdatedAt(),
                producto.getDeletedAt()
        );
    }
}
