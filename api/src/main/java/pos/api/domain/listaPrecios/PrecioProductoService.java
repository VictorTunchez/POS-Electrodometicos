package pos.api.domain.listaPrecios;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pos.api.domain.producto.IProductoRepository;
import pos.api.domain.producto.Producto;
import pos.api.domain.unidadMedida.IUnidadMedidaRepository;
import pos.api.domain.unidadMedida.UnidadMedida;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class PrecioProductoService {

    private final IPrecioProductoRepository precioProductoRepository;
    private final IProductoRepository productoRepository;
    private final IUnidadMedidaRepository unidadMedidaRepository;
    private final CalculadoraPreciosService calculadoraPreciosService;

    public PrecioProductoResponseDto crear(PrecioProductoRequestDto dto) {
        // Validar que el producto existe
        Producto producto = productoRepository.findByIdAndDeletedAtIsNull(dto.productoId())
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + dto.productoId()));

        // Validar que la unidad de medida existe
        UnidadMedida unidadMedida = unidadMedidaRepository.findById(dto.unidadMedidaId())
                .orElseThrow(() -> new IllegalArgumentException("Unidad de medida no encontrada con ID: " + dto.unidadMedidaId()));

        // Validar que no exista un precio activo con la misma combinación
        if (precioProductoRepository.existsByProductoIdAndUnidadMedidaIdAndTipoPrecioAndActivoTrue(
                dto.productoId(), dto.unidadMedidaId(), dto.tipoPrecio())) {
            throw new IllegalStateException("Ya existe un precio activo para este producto, unidad de medida y tipo de precio");
        }

        PrecioProducto precioProducto = new PrecioProducto();
        precioProducto.setProducto(producto);
        precioProducto.setUnidadMedida(unidadMedida);
        precioProducto.setTipoPrecio(dto.tipoPrecio());
        precioProducto.setPrecio(dto.precio());
        precioProducto.setMinimoCantidad(dto.minimoCantidad());
        precioProducto.setActivo(true);

        PrecioProducto guardado = precioProductoRepository.save(precioProducto);
        return mapToResponse(guardado);
    }

    public List<PrecioProductoResponseDto> obtenerPreciosPorProducto(Long productoId) {
        return precioProductoRepository.findByProductoIdAndActivoTrue(productoId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public PrecioProductoResponseDto obtenerPrecioPorId(Long id) {
        PrecioProducto precioProducto = precioProductoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Precio de producto no encontrado con ID: " + id));
        return mapToResponse(precioProducto);
    }

    public PrecioProductoResponseDto actualizar(Long id, ActualizarPrecioProductoRequestDto dto) {
        PrecioProducto precioProducto = precioProductoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Precio de producto no encontrado con ID: " + id));

        precioProducto.setPrecio(dto.precio());
        precioProducto.setMinimoCantidad(dto.minimoCantidad());

        if (dto.activo() != null) {
            precioProducto.setActivo(dto.activo());
        }

        PrecioProducto actualizado = precioProductoRepository.save(precioProducto);
        return mapToResponse(actualizado);
    }

    public void desactivar(Long id) {
        PrecioProducto precioProducto = precioProductoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Precio de producto no encontrado con ID: " + id));
        precioProducto.setActivo(false);
        precioProductoRepository.save(precioProducto);
    }

    public BigDecimal calcularPrecio(CalcularPrecioRequestDto dto) {
        return calculadoraPreciosService.calcularPrecioPorUnidad(
                dto.productoId(), dto.unidadMedidaId(), dto.cantidad(),
                dto.tipoPrecio() != null ? dto.tipoPrecio() : TipoPrecio.MINORISTA);
    }

    public List<PrecioProductoResponseDto> generarPreciosAutomaticos(GenerarPreciosAutomaticosRequestDto dto) {
        Producto producto = productoRepository.findByIdAndDeletedAtIsNull(dto.productoId())
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + dto.productoId()));

        // Actualizar margen por defecto del producto
        producto.setMargenDefault(dto.porcentajeMargen());
        productoRepository.save(producto);

        // Desactivar precios existentes
        List<PrecioProducto> preciosExistentes = precioProductoRepository.findByProductoIdAndActivoTrue(dto.productoId());
        preciosExistentes.forEach(precio -> precio.setActivo(false));
        precioProductoRepository.saveAll(preciosExistentes);

        // Generar nuevos precios automáticos
        List<PrecioProducto> nuevosPrecios = calculadoraPreciosService.generarPreciosAutomaticos(producto, dto.porcentajeMargen());
        List<PrecioProducto> preciosGuardados = precioProductoRepository.saveAll(nuevosPrecios);

        return preciosGuardados.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public PrecioProductoResponseDto obtenerPrecioVigente(Long productoId, Long unidadMedidaId, TipoPrecio tipoPrecio) {
        PrecioProducto precioProducto = precioProductoRepository
                .findByProductoIdAndUnidadMedidaIdAndTipoPrecioAndActivoTrue(productoId, unidadMedidaId, tipoPrecio)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró precio vigente para los criterios especificados"));

        return mapToResponse(precioProducto);
    }

    public Map<String, Object> obtenerInformacionMargen(Long productoId) {
        Producto producto = productoRepository.findByIdAndDeletedAtIsNull(productoId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        // Obtener precio minorista vigente
        PrecioProducto precioMinorista = precioProductoRepository
                .findByProductoIdAndUnidadMedidaIdAndTipoPrecioAndActivoTrue(
                        productoId, producto.getUnidadMedida().getId(), TipoPrecio.MINORISTA)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró precio minorista para el producto"));

        BigDecimal margenActual = calculadoraPreciosService.calcularMargenGanancia(
                producto.getCostoPromedio(), precioMinorista.getPrecio());

        Map<String, Object> info = new HashMap<>();
        info.put("productoId", productoId);
        info.put("nombreProducto", producto.getNombreProducto());
        info.put("costoPromedio", producto.getCostoPromedio());
        info.put("precioVenta", precioMinorista.getPrecio());
        info.put("margenActual", margenActual);
        info.put("margenDefault", producto.getMargenDefault());
        info.put("gananciaUnitaria", precioMinorista.getPrecio().subtract(producto.getCostoPromedio()));

        return info;
    }

    private PrecioProductoResponseDto mapToResponse(PrecioProducto precioProducto) {
        return new PrecioProductoResponseDto(
                precioProducto.getId(),
                precioProducto.getProducto().getId(),
                precioProducto.getProducto().getNombreProducto(),
                precioProducto.getUnidadMedida().getId(),
                precioProducto.getUnidadMedida().getNombre(),
                precioProducto.getUnidadMedida().getAbreviatura(),
                precioProducto.getTipoPrecio(),
                precioProducto.getPrecio(),
                precioProducto.getMinimoCantidad(),
                precioProducto.getActivo(),
                precioProducto.getCreatedAt(),
                precioProducto.getUpdatedAt()
        );
    }
}