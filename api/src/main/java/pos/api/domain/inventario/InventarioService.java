package pos.api.domain.inventario;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pos.api.domain.producto.IProductoRepository;
import pos.api.domain.producto.Producto;
import pos.api.domain.sucursal.ISucursalRepository;
import pos.api.domain.sucursal.Sucursal;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventarioService {

    private final IInventarioRepository inventarioRepository;
    private final IProductoRepository productoRepository;
    private final ISucursalRepository sucursalRepository;

    @Transactional
    public InventarioResponseDto crearRegistroInventario(InventarioRequestDto dto) {
        Producto producto = productoRepository.findByIdAndDeletedAtIsNull(dto.productoId())
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado o inactivo con ID: " + dto.productoId()));

        Sucursal sucursal = sucursalRepository.findById(dto.sucursalId())
                .orElseThrow(() -> new IllegalArgumentException("Sucursal no encontrada con ID: " + dto.sucursalId()));

        // Validar que no exista ya inventario para este producto en esta sucursal
        if (inventarioRepository.existsByProductoIdAndSucursalId(dto.productoId(), dto.sucursalId())) {
            throw new IllegalStateException("Ya existe un inventario para este producto en la sucursal");
        }

        // Validar que el stock mínimo no sea negativo
        if (dto.stockMinimo().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El stock mínimo no puede ser negativo");
        }

        // SIEMPRE crear con stock actual 0 y stock mínimo por defecto 5
        Inventario inventario = new Inventario();
        inventario.setProducto(producto);
        inventario.setSucursal(sucursal);
        inventario.setStockActual(BigDecimal.ZERO);

        // Stock mínimo: usar el proporcionado o 5 por defecto
        BigDecimal stockMinimo = dto.stockMinimo() != null ? dto.stockMinimo() : new BigDecimal(5);
        inventario.setStockMinimo(stockMinimo);

        Inventario guardado = inventarioRepository.save(inventario);
        return mapToResponse(guardado);
    }

    public List<InventarioResponseDto> listarInventarioCompleto() {
        return inventarioRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<InventarioResponseDto> listarInventarioPorSucursal(Long sucursalId) {
        return inventarioRepository.findBySucursalId(sucursalId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public InventarioResponseDto obtenerInventarioPorId(Long id) {
        Inventario inventario = inventarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventario no encontrado con ID: " + id));
        return mapToResponse(inventario);
    }

    public InventarioResponseDto obtenerInventario(Long productoId, Long sucursalId) {
        Inventario inventario = inventarioRepository.findByProductoIdAndSucursalId(productoId, sucursalId)
                .orElseThrow(() -> new IllegalArgumentException("Inventario no encontrado para producto " + productoId + " en sucursal " + sucursalId));
        return mapToResponse(inventario);
    }

    @Transactional
    public InventarioResponseDto actualizarInventario(Long id, InventarioRequestDto dto) {
        Inventario inventario = inventarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventario no encontrado con ID: " + id));

        // Validar que si se cambia producto/sucursal, no exista duplicado
        if (!inventario.getProducto().getId().equals(dto.productoId()) ||
                !inventario.getSucursal().getId().equals(dto.sucursalId())) {

            if (inventarioRepository.existsByProductoIdAndSucursalId(dto.productoId(), dto.sucursalId())) {
                throw new IllegalStateException("Ya existe un inventario para este producto en la sucursal");
            }
        }

        Producto producto = productoRepository.findByIdAndDeletedAtIsNull(dto.productoId())
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + dto.productoId()));

        Sucursal sucursal = sucursalRepository.findById(dto.sucursalId())
                .orElseThrow(() -> new IllegalArgumentException("Sucursal no encontrada con ID: " + dto.sucursalId()));

        if (dto.stockMinimo().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El stock mínimo no puede ser negativo");
        }

        // ACTUALIZAR SOLO DATOS BÁSICOS - NUNCA EL STOCK ACTUAL
        inventario.setProducto(producto);
        inventario.setSucursal(sucursal);
        inventario.setStockMinimo(dto.stockMinimo());

        Inventario actualizado = inventarioRepository.save(inventario);
        return mapToResponse(actualizado);
    }

    @Transactional
    public void eliminarInventario(Long id) {
        if (!inventarioRepository.existsById(id)) {
            throw new IllegalArgumentException("Inventario no encontrado con ID: " + id);
        }
        inventarioRepository.deleteById(id);
    }

    public List<InventarioResponseDto> listarProductosConStockBajo() {
        return inventarioRepository.findByStockActualLessThanEqualStockMinimo().stream()
                .map(this::mapToResponse)
                .toList();
    }


     // METODOS INTERNOS PARA COMPRAS/VENTAS (NO EXPUESTOS EN CONTROLLER)
    @Transactional
    public void actualizarStockPorCompra(Long productoId, Long sucursalId, BigDecimal cantidad) {
        Inventario inventario = obtenerOcrearInventario(productoId, sucursalId);
        inventario.agregarStock(cantidad);
        inventarioRepository.save(inventario);
    }

    @Transactional
    public void actualizarStockPorVenta(Long productoId, Long sucursalId, BigDecimal cantidad) {
        Inventario inventario = inventarioRepository
                .findByProductoIdAndSucursalId(productoId, sucursalId)
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado"));

        // Validar stock suficiente
        if (inventario.getStockActual().compareTo(cantidad) < 0) {
            throw new RuntimeException("Stock insuficiente. Stock actual: " + inventario.getStockActual() + ", solicitado: " + cantidad);
        }

        inventario.reducirStock(cantidad);
        inventarioRepository.save(inventario);
    }

    public BigDecimal obtenerStockActual(Long productoId, Long sucursalId) {
        return inventarioRepository.findByProductoIdAndSucursalId(productoId, sucursalId)
                .map(Inventario::getStockActual)
                .orElse(BigDecimal.ZERO);
    }

    private Inventario obtenerOcrearInventario(Long productoId, Long sucursalId) {
        return inventarioRepository
                .findByProductoIdAndSucursalId(productoId, sucursalId)
                .orElseGet(() -> {
                    // Crear automáticamente si no existe
                    Producto producto = productoRepository.getReferenceById(productoId);
                    Sucursal sucursal = sucursalRepository.getReferenceById(sucursalId);

                    Inventario nuevo = new Inventario();
                    nuevo.setProducto(producto);
                    nuevo.setSucursal(sucursal);
                    nuevo.setStockActual(BigDecimal.ZERO);
                    nuevo.setStockMinimo(new BigDecimal(5));
                    return inventarioRepository.save(nuevo);
                });
    }

    private InventarioResponseDto mapToResponse(Inventario inventario) {
        return new InventarioResponseDto(
                inventario.getId(),
                inventario.getProducto().getId(),
                inventario.getProducto().getNombreProducto(),
                inventario.getProducto().getCodigoBarras(),
                inventario.getSucursal().getId(),
                inventario.getSucursal().getNombreSucursal(),
                inventario.getStockActual(),
                inventario.getStockMinimo(),
                inventario.getFechaActualizacion(),
                inventario.getCreatedAt(),
                inventario.getUpdatedAt()
        );
    }
}