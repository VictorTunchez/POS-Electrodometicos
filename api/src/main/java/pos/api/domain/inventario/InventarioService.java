package pos.api.domain.inventario;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pos.api.domain.product.IProductoRepository;
import pos.api.domain.product.Producto;
import pos.api.domain.sucursal.ISucursalRepository;
import pos.api.domain.sucursal.Sucursal;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventarioService {

    private final IInventarioRepository inventarioRepository;
    private final IProductoRepository productoRepository;
    private final ISucursalRepository sucursalRepository;

    public InventarioResponseDto crearRegistroInventario(InventarioRequestDto dto) {
        Producto producto = productoRepository.findByIdAndDeletedAtIsNull(dto.productoId())
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado o inactivo con ID: " + dto.productoId()));

        Sucursal sucursal = sucursalRepository.findById(dto.sucursalId())
                .orElseThrow(() -> new IllegalArgumentException("Sucursal no encontrada con ID: " + dto.sucursalId()));

        // Validar que no exista ya inventario para este producto en esta sucursal
        if (inventarioRepository.existsByProductoIdAndSucursalId(dto.productoId(), dto.sucursalId())) {
            throw new IllegalStateException("Ya existe un inventario para este producto en la sucursal");
        }

        if (dto.stockMinimo() < 0) throw new IllegalArgumentException("El stock mínimo no puede ser negativo");
        if (dto.stockActual() < 0) throw new IllegalArgumentException("El stock actual no puede ser negativo");

        Inventario inventario = new Inventario();
        inventario.setProducto(producto);
        inventario.setSucursal(sucursal);
        inventario.setStockActual(dto.stockActual());
        inventario.setStockMinimo(dto.stockMinimo());

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

        if (dto.stockMinimo() < 0) throw new IllegalArgumentException("El stock mínimo no puede ser negativo");
        if (dto.stockActual() < 0) throw new IllegalArgumentException("El stock actual no puede ser negativo");

        inventario.setProducto(producto);
        inventario.setSucursal(sucursal);
        inventario.setStockActual(dto.stockActual());
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

    @Transactional
    public InventarioResponseDto ajustarStock(Long id, Integer cantidad) {
        Inventario inventario = inventarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventario no encontrado con ID: " + id));

        int nuevoStock = inventario.getStockActual() + cantidad;
        if (nuevoStock < 0) throw new IllegalArgumentException("No hay suficiente stock");

        inventario.setStockActual(nuevoStock);
        return mapToResponse(inventarioRepository.save(inventario));
    }

    @Transactional
    public InventarioResponseDto ajustarStock(Long productoId, Long sucursalId, Integer cantidad) {
        Inventario inventario = inventarioRepository.findByProductoIdAndSucursalId(productoId, sucursalId)
                .orElseThrow(() -> new IllegalArgumentException("Inventario no encontrado para producto " + productoId + " en sucursal " + sucursalId));

        int nuevoStock = inventario.getStockActual() + cantidad;
        if (nuevoStock < 0) throw new IllegalArgumentException("No hay suficiente stock");

        inventario.setStockActual(nuevoStock);
        return mapToResponse(inventarioRepository.save(inventario));
    }

    @Transactional
    public InventarioResponseDto actualizarStockMinimo(Long id, Integer stockMinimo) {
        Inventario inventario = inventarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventario no encontrado con ID: " + id));

        if (stockMinimo < 0) throw new IllegalArgumentException("El stock mínimo no puede ser negativo");

        inventario.setStockMinimo(stockMinimo);
        return mapToResponse(inventarioRepository.save(inventario));
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