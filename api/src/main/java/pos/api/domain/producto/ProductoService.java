package pos.api.domain.producto;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pos.api.domain.listaPrecios.CalculadoraPreciosService;
import pos.api.domain.listaPrecios.IPrecioProductoRepository;
import pos.api.domain.listaPrecios.PrecioProducto;
import pos.api.domain.unidadMedida.IUnidadMedidaRepository;
import pos.api.domain.unidadMedida.UnidadMedida;
import pos.api.domain.categoria.Categoria;
import pos.api.domain.categoria.ICategoriaRepository;
import pos.api.domain.inventario.IInventarioRepository;
import pos.api.domain.inventario.Inventario;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductoService {

    private final IProductoRepository productoRepository;
    private final ICategoriaRepository categoriaRepository;
    private final IInventarioRepository inventarioRepository;
    private final IUnidadMedidaRepository unidadMedidaRepository;
    private final IPrecioProductoRepository precioProductoRepository;
    private final CalculadoraPreciosService calculadoraPreciosService;

    @Transactional
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

        // Validar unidad de medida
        UnidadMedida unidadMedida = unidadMedidaRepository.findById(dto.unidadMedidaId())
                .orElseThrow(() -> new IllegalArgumentException("Unidad de medida no encontrada con ID: " + dto.unidadMedidaId()));

        // Validar unidad de compra si se proporciona
        UnidadMedida unidadCompra = null;
        if (dto.unidadCompraId() != null) {
            unidadCompra = unidadMedidaRepository.findById(dto.unidadCompraId())
                    .orElseThrow(() -> new IllegalArgumentException("Unidad de compra no encontrada con ID: " + dto.unidadCompraId()));

            // Validar que si hay unidad de compra, debe haber factor de conversión
            if (dto.factorConversion() == null) {
                throw new IllegalArgumentException("El factor de conversión es obligatorio cuando se especifica unidad de compra");
            }
        }

        Producto producto = new Producto();
        producto.setNombreProducto(dto.nombreProducto());
        producto.setCodigoBarras(dto.codigoBarras());
        producto.setDescripcion(dto.descripcion());

        // Imagen opcional
        if (dto.imagen() != null && !dto.imagen().isBlank()) {
            producto.setImagen(dto.imagen());
        }

        producto.setCategoria(categoria);

        // Asignar unidades de medida
        producto.setUnidadMedida(unidadMedida);
        producto.setUnidadCompra(unidadCompra);
        producto.setFactorConversion(dto.factorConversion());

        // NUEVO: Asignar margen por defecto (30% si no se especifica)
        producto.setMargenDefault(dto.margenDefault() != null ? dto.margenDefault() : new BigDecimal("30.00"));

        producto.setDestacado(dto.destacado() != null ? dto.destacado() : false);

        // Validar consistencia de unidades
        producto.validarUnidades();

        Producto guardado = productoRepository.save(producto);

        // NUEVO: Generar precios automáticamente después de crear el producto
        if (dto.generarPreciosAutomaticos() == null || dto.generarPreciosAutomaticos()) {
            List<PrecioProducto> preciosAutomaticos = calculadoraPreciosService.generarPreciosAutomaticos(
                    guardado, guardado.getMargenDefault());
            precioProductoRepository.saveAll(preciosAutomaticos);
        }

        return mapToResponse(guardado);
    }

    @Transactional
    public ProductoResponseDto actualizarProducto(Long id, ActualizarProductoRequestDto dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + id));

        // GUARDAR ESTADO ANTERIOR para detectar cambios
        UnidadMedida unidadMedidaAnterior = producto.getUnidadMedida();
        UnidadMedida unidadCompraAnterior = producto.getUnidadCompra();
        BigDecimal factorConversionAnterior = producto.getFactorConversion();
        BigDecimal margenAnterior = producto.getMargenDefault();

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

        // Validar y asignar unidades de medida
        UnidadMedida unidadMedida = unidadMedidaRepository.findById(dto.unidadMedidaId())
                .orElseThrow(() -> new IllegalArgumentException("Unidad de medida no encontrada con ID: " + dto.unidadMedidaId()));

        UnidadMedida unidadCompra = null;
        if (dto.unidadCompraId() != null) {
            unidadCompra = unidadMedidaRepository.findById(dto.unidadCompraId())
                    .orElseThrow(() -> new IllegalArgumentException("Unidad de compra no encontrada con ID: " + dto.unidadCompraId()));

            if (dto.factorConversion() == null) {
                throw new IllegalArgumentException("El factor de conversión es obligatorio cuando se especifica unidad de compra");
            }
        }

        producto.setNombreProducto(dto.nombreProducto());
        producto.setCodigoBarras(dto.codigoBarras());
        producto.setDescripcion(dto.descripcion());

        // Imagen opcional
        if (dto.imagen() != null) {
            producto.setImagen(dto.imagen().isBlank() ? null : dto.imagen());
        }

        producto.setCategoria(categoria);
        producto.setUnidadMedida(unidadMedida);
        producto.setUnidadCompra(unidadCompra);
        producto.setFactorConversion(dto.factorConversion());

        // Actualizar margen por defecto
        if (dto.margenDefault() != null) {
            producto.setMargenDefault(dto.margenDefault());
        }

        producto.setDestacado(dto.destacado());
        producto.validarUnidades();

        Producto actualizado = productoRepository.save(producto);

        //DETECTAR CAMBIOS QUE REQUIEREN ACTUALIZAR PRECIOS
        boolean cambioRelevante =
                !unidadMedidaAnterior.getId().equals(dto.unidadMedidaId()) ||
                        (unidadCompraAnterior != null && !unidadCompraAnterior.getId().equals(dto.unidadCompraId())) ||
                        (unidadCompraAnterior == null && dto.unidadCompraId() != null) ||
                        (unidadCompraAnterior != null && dto.unidadCompraId() == null) ||
                        (factorConversionAnterior != null && !factorConversionAnterior.equals(dto.factorConversion())) ||
                        (factorConversionAnterior == null && dto.factorConversion() != null) ||
                        (margenAnterior != null && !margenAnterior.equals(dto.margenDefault()));

        // ACTUALIZAR PRECIOS SI HUBO CAMBIOS RELEVANTES
        if (cambioRelevante) {
            actualizarPreciosProducto(actualizado);
        }

        return mapToResponse(actualizado);
    }

    // NUEVO METODO PARA ACTUALIZAR PRECIOS
    private void actualizarPreciosProducto(Producto producto) {
        // Desactivar todos los precios activos del producto
        List<PrecioProducto> preciosExistentes = precioProductoRepository.findByProductoIdAndActivoTrue(producto.getId());
        for (PrecioProducto precio : preciosExistentes) {
            precio.setActivo(false);
            precio.setUpdatedAt(Instant.now());
        }
        precioProductoRepository.saveAll(preciosExistentes);

        //  Generar nuevos precios basados en la unidad y margen actuales
        List<PrecioProducto> preciosNuevos = calculadoraPreciosService.generarPreciosAutomaticos(
                producto, producto.getMargenDefault());

        List<PrecioProducto> preciosAActualizar = new ArrayList<>();
        List<PrecioProducto> preciosANuevos = new ArrayList<>();

        for (PrecioProducto nuevo : preciosNuevos) {
            Optional<PrecioProducto> existenteOpt =
                    precioProductoRepository.findByProductoIdAndUnidadMedidaIdAndTipoPrecio(
                            producto.getId(),
                            nuevo.getUnidadMedida().getId(),
                            nuevo.getTipoPrecio()
                    );

            if (existenteOpt.isPresent()) {
                PrecioProducto existente = existenteOpt.get();
                existente.setPrecio(nuevo.getPrecio());
                existente.setMinimoCantidad(nuevo.getMinimoCantidad());
                existente.setActivo(true);
                existente.setUpdatedAt(Instant.now());
                preciosAActualizar.add(existente);
            } else {
                nuevo.setActivo(true);
                preciosANuevos.add(nuevo);
            }
        }

        //  Guardar actualizados y nuevos
        if (!preciosAActualizar.isEmpty()) {
            precioProductoRepository.saveAll(preciosAActualizar);
        }

        if (!preciosANuevos.isEmpty()) {
            precioProductoRepository.saveAll(preciosANuevos);
        }
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

    // NUEVO: Metodo opcional para buscar productos por unidad de medida
    public List<ProductoResponseDto> listarProductosPorUnidadMedida(Long unidadMedidaId) {
        UnidadMedida unidadMedida = unidadMedidaRepository.findById(unidadMedidaId)
                .orElseThrow(() -> new IllegalArgumentException("Unidad de medida no encontrada con ID: " + unidadMedidaId));

        return productoRepository.findByUnidadMedidaAndDeletedAtIsNull(unidadMedida).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ProductoResponseDto mapToResponse(Producto producto) {
        // NUEVO: Obtener precios activos del producto
        List<PrecioProducto> precios = precioProductoRepository.findByProductoIdAndActivoTrue(producto.getId());
        List<PrecioSimpleResponseDto> preciosResponse = precios.stream()
                .map(this::mapToPrecioSimpleResponse)
                .toList();

        return new ProductoResponseDto(
                producto.getId(),
                producto.getCodigoBarras(),
                producto.getNombreProducto(),
                producto.getDescripcion(),
                producto.getUltimoCosto(),
                producto.getCostoPromedio(),
                producto.getImagen(),
                producto.getCategoria() != null ? producto.getCategoria().getId() : null,
                producto.getCategoria() != null ? producto.getCategoria().getNombreCategoria() : null,
                producto.getUnidadMedida() != null ? producto.getUnidadMedida().getId() : null,
                producto.getUnidadMedida() != null ? producto.getUnidadMedida().getNombre() : null,
                producto.getUnidadMedida() != null ? producto.getUnidadMedida().getAbreviatura() : null,
                producto.getUnidadCompra() != null ? producto.getUnidadCompra().getId() : null,
                producto.getUnidadCompra() != null ? producto.getUnidadCompra().getNombre() : null,
                producto.getUnidadCompra() != null ? producto.getUnidadCompra().getAbreviatura() : null,
                producto.getFactorConversion(),
                // NUEVO: Campos agregados
                producto.getMargenDefault(),
                preciosResponse,
                producto.getDestacado(),
                producto.getCreatedAt(),
                producto.getUpdatedAt(),
                producto.getDeletedAt()
        );
    }

    // NUEVO: Metodo para mapear precios simples
    private PrecioSimpleResponseDto mapToPrecioSimpleResponse(PrecioProducto precio) {
        return new PrecioSimpleResponseDto(
                precio.getId(),
                precio.getUnidadMedida().getId(),
                precio.getUnidadMedida().getNombre(),
                precio.getUnidadMedida().getAbreviatura(),
                precio.getTipoPrecio(),
                precio.getPrecio(),
                precio.getMinimoCantidad()
        );
    }
}


