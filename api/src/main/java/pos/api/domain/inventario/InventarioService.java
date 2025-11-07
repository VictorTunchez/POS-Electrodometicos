package pos.api.domain.inventario;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import pos.api.domain.inventario.movimientos.IMovimientoInventarioRepository;
import pos.api.domain.inventario.movimientos.MovimientoInventario;
import pos.api.domain.inventario.movimientos.TipoMovimiento;
import pos.api.domain.producto.IProductoRepository;
import pos.api.domain.producto.Producto;
import pos.api.domain.sucursal.ISucursalRepository;
import pos.api.domain.sucursal.Sucursal;
import pos.api.domain.usuario.IUsuarioRepository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventarioService {

    private final IInventarioRepository inventarioRepository;
    private final IProductoRepository productoRepository;
    private final ISucursalRepository sucursalRepository;
    private final IUsuarioRepository usuarioRepository;
    private final IMovimientoInventarioRepository movimientoInventarioRepository;

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
    // VERSIÓN ORIGINAL (mantenemos compatibilidad)
    @Transactional
    public void actualizarStockPorCompra(Long productoId, Long sucursalId, BigDecimal cantidad) {
        actualizarStockPorCompra(productoId, sucursalId, cantidad, null, null, "Compra sin usuario especificado");
    }

    @Transactional
    public void actualizarStockPorVenta(Long productoId, Long sucursalId, BigDecimal cantidad) {
        actualizarStockPorVenta(productoId, sucursalId, cantidad, null, null, "Venta sin usuario especificado");
    }

    // NUEVAS VERSIONES CON REGISTRO DE MOVIMIENTOS
    @Transactional
    public void actualizarStockPorCompra(Long productoId, Long sucursalId, BigDecimal cantidad,
                                         Long usuarioId, Long compraId, String observaciones) {
        Inventario inventario = obtenerOcrearInventario(productoId, sucursalId);
        BigDecimal stockAnterior = inventario.getStockActual();

        inventario.agregarStock(cantidad);
        inventarioRepository.save(inventario);

        // Registrar movimiento
        registrarMovimientoInventario(
                inventario,
                TipoMovimiento.ENTRADA,
                cantidad,
                stockAnterior,
                inventario.getStockActual(),
                usuarioId,
                "COMPRA",
                compraId,
                observaciones != null ? observaciones : "Entrada por compra"
        );
    }

    @Transactional
    public void actualizarStockPorVenta(Long productoId, Long sucursalId, BigDecimal cantidad,
                                        Long usuarioId, Long ventaId, String observaciones) {

        // ELIMINAMOS la verificación previa - dejamos que la constraint única maneje los duplicados
        Inventario inventario = obtenerOcrearInventario(productoId, sucursalId);
        BigDecimal stockAnterior = inventario.getStockActual();

        // Validar stock suficiente solo si es una venta (cantidad positiva)
        if (cantidad.compareTo(BigDecimal.ZERO) > 0) {
            if (inventario.getStockActual().compareTo(cantidad) < 0) {
                throw new RuntimeException("Stock insuficiente. Stock actual: " + inventario.getStockActual() + ", solicitado: " + cantidad);
            }
            inventario.reducirStock(cantidad);
        } else {
            // Si es cantidad negativa (cancelación), agregar stock
            inventario.agregarStock(cantidad.abs());
        }

        inventarioRepository.save(inventario);

        // Registrar movimiento - LA CONSTRAINT ÚNICA EVITARÁ DUPLICADOS
        registrarMovimientoInventario(
                inventario,
                cantidad.compareTo(BigDecimal.ZERO) > 0 ? TipoMovimiento.SALIDA : TipoMovimiento.ENTRADA,
                cantidad.abs(),
                stockAnterior,
                inventario.getStockActual(),
                usuarioId,
                "VENTA",
                ventaId,
                observaciones
        );
    }


    // Metodo para traslados
    @Transactional
    public void actualizarStockPorTraslado(Long productoId, Long sucursalId, BigDecimal cantidad,
                                           Long usuarioId, Long trasladoId, String observaciones) {
        Inventario inventario = obtenerOcrearInventario(productoId, sucursalId);
        BigDecimal stockAnterior = inventario.getStockActual();

        if (cantidad.compareTo(BigDecimal.ZERO) > 0) {
            inventario.agregarStock(cantidad);
        } else {
            inventario.reducirStock(cantidad.abs());
        }

        inventarioRepository.save(inventario);

        // Registrar movimiento
        registrarMovimientoInventario(
                inventario,
                cantidad.compareTo(BigDecimal.ZERO) > 0 ? TipoMovimiento.TRASLADO_ENTRADA : TipoMovimiento.TRASLADO_SALIDA,
                cantidad.abs(),
                stockAnterior,
                inventario.getStockActual(),
                usuarioId,
                "TRASLADO",
                trasladoId,
                observaciones
        );
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

    private void registrarMovimientoInventario(Inventario inventario, TipoMovimiento tipoMovimiento,
                                               BigDecimal cantidad, BigDecimal stockAnterior,
                                               BigDecimal stockPosterior, Long usuarioId,
                                               String referenciaTipo, Long referenciaId,
                                               String observaciones) {
        try {
            MovimientoInventario movimiento = new MovimientoInventario();
            movimiento.setProducto(inventario.getProducto());
            movimiento.setSucursal(inventario.getSucursal());
            movimiento.setTipoMovimiento(tipoMovimiento);
            movimiento.setCantidad(cantidad);
            movimiento.setStockAnterior(stockAnterior);
            movimiento.setStockPosterior(stockPosterior);
            movimiento.setFechaMovimiento(Instant.now());

            if (usuarioId != null) {
                movimiento.setUsuario(usuarioRepository.findById(usuarioId)
                        .orElse(usuarioRepository.getReferenceById(usuarioId)));
            } else {
                movimiento.setUsuario(null);
            }

            movimiento.setReferenciaTipo(referenciaTipo);
            movimiento.setReferenciaId(referenciaId);
            movimiento.setObservaciones(observaciones);

            movimientoInventarioRepository.save(movimiento);

            System.out.println("Movimiento registrado: " + tipoMovimiento +
                    " - Producto: " + inventario.getProducto().getNombreProducto() +
                    " - Cantidad: " + cantidad);

        } catch (DataIntegrityViolationException e) {
            // ESTA ES LA CLAVE: Capturar la violación de constraint única
            System.out.println("🟡 Movimiento DUPLICADO detectado y evitado: " +
                    "Producto: " + inventario.getProducto().getId() +
                    ", Sucursal: " + inventario.getSucursal().getId() +
                    ", Referencia: " + referenciaTipo + "-" + referenciaId);
            // No hacemos nada - simplemente ignoramos el movimiento duplicado
        } catch (Exception e) {
            System.err.println("Error al registrar movimiento de inventario: " + e.getMessage());
        }
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