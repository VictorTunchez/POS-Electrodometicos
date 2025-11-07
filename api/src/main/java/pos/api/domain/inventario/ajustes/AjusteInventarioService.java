package pos.api.domain.inventario.ajustes;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pos.api.domain.inventario.IInventarioRepository;
import pos.api.domain.inventario.Inventario;
import pos.api.domain.inventario.movimientos.IMovimientoInventarioRepository;
import pos.api.domain.inventario.movimientos.MovimientoInventario;
import pos.api.domain.inventario.movimientos.TipoMovimiento;
import pos.api.domain.producto.IProductoRepository;
import pos.api.domain.producto.Producto;
import pos.api.domain.sucursal.ISucursalRepository;
import pos.api.domain.sucursal.Sucursal;
import pos.api.domain.usuario.IUsuarioRepository;
import pos.api.domain.usuario.Usuario;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AjusteInventarioService {

    private final IAjusteInventarioRepository ajusteInventarioRepository;
    private final IInventarioRepository inventarioRepository;
    private final IProductoRepository productoRepository;
    private final ISucursalRepository sucursalRepository;
    private final IUsuarioRepository usuarioRepository;
    private final IMovimientoInventarioRepository movimientoInventarioRepository;

    @Transactional
    public AjusteInventarioResponseDto realizarAjuste(AjusteInventarioRequestDto dto, Long usuarioId) {
        // Validaciones básicas
        if (dto.cantidad().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
        }

        Producto producto = productoRepository.findByIdAndDeletedAtIsNull(dto.productoId())
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + dto.productoId()));

        Sucursal sucursal = sucursalRepository.findById(dto.sucursalId())
                .orElseThrow(() -> new IllegalArgumentException("Sucursal no encontrada con ID: " + dto.sucursalId()));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + usuarioId));

        // Obtener o crear inventario
        Inventario inventario = inventarioRepository
                .findByProductoIdAndSucursalId(dto.productoId(), dto.sucursalId())
                .orElseGet(() -> crearInventarioAutomatico(dto.productoId(), dto.sucursalId()));

        BigDecimal stockAnterior = inventario.getStockActual();
        BigDecimal stockNuevo;
        BigDecimal diferencia;

        // Calcular nuevo stock según tipo de ajuste
        switch (dto.tipoAjuste()) {
            case INCREMENTO:
                stockNuevo = stockAnterior.add(dto.cantidad());
                diferencia = dto.cantidad();
                break;
            case DECREMENTO:
                if (stockAnterior.compareTo(dto.cantidad()) < 0) {
                    throw new IllegalStateException(
                            "Stock insuficiente. Stock actual: " + stockAnterior +
                                    ", intentando reducir: " + dto.cantidad()
                    );
                }
                stockNuevo = stockAnterior.subtract(dto.cantidad());
                diferencia = dto.cantidad().negate();
                break;
            case CORRECCION:
                stockNuevo = dto.cantidad();
                diferencia = dto.cantidad().subtract(stockAnterior);
                break;
            default:
                throw new IllegalArgumentException("Tipo de ajuste no válido: " + dto.tipoAjuste());
        }

        // Validar que no quede stock negativo
        if (stockNuevo.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("El ajuste resultaría en stock negativo: " + stockNuevo);
        }

        // Crear registro de ajuste
        AjusteInventario ajuste = new AjusteInventario();
        ajuste.setProducto(producto);
        ajuste.setSucursal(sucursal);
        ajuste.setStockAnterior(stockAnterior);
        ajuste.setStockNuevo(stockNuevo);
        ajuste.setDiferencia(diferencia);
        ajuste.setTipoAjuste(dto.tipoAjuste());
        ajuste.setMotivo(dto.motivo());
        ajuste.setObservaciones(dto.observaciones());
        ajuste.setUsuario(usuario);

        AjusteInventario ajusteGuardado = ajusteInventarioRepository.save(ajuste);

        // Actualizar inventario
        inventario.setStockActual(stockNuevo);
        inventarioRepository.save(inventario);

        // Registrar movimiento de inventario
        registrarMovimientoInventario(ajusteGuardado, inventario, usuario);

        return mapToResponse(ajusteGuardado);
    }

    private Inventario crearInventarioAutomatico(Long productoId, Long sucursalId) {
        Producto producto = productoRepository.getReferenceById(productoId);
        Sucursal sucursal = sucursalRepository.getReferenceById(sucursalId);

        Inventario nuevoInventario = new Inventario();
        nuevoInventario.setProducto(producto);
        nuevoInventario.setSucursal(sucursal);
        nuevoInventario.setStockActual(BigDecimal.ZERO);
        nuevoInventario.setStockMinimo(new BigDecimal(5));

        return inventarioRepository.save(nuevoInventario);
    }

    private void registrarMovimientoInventario(AjusteInventario ajuste, Inventario inventario, Usuario usuario) {
        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setProducto(ajuste.getProducto());
        movimiento.setSucursal(ajuste.getSucursal());
        movimiento.setTipoMovimiento(determinarTipoMovimiento(ajuste.getTipoAjuste(), ajuste.getDiferencia()));
        movimiento.setCantidad(ajuste.getDiferencia().abs());
        movimiento.setStockAnterior(ajuste.getStockAnterior());
        movimiento.setStockPosterior(ajuste.getStockNuevo());
        movimiento.setUsuario(usuario);
        movimiento.setReferenciaId(ajuste.getId());
        movimiento.setReferenciaTipo("AJUSTE");
        movimiento.setObservaciones("Ajuste: " + ajuste.getMotivo() +
                (ajuste.getObservaciones() != null ? " - " + ajuste.getObservaciones() : ""));

        movimientoInventarioRepository.save(movimiento);
    }

    private TipoMovimiento determinarTipoMovimiento(TipoAjuste tipoAjuste, BigDecimal diferencia) {
        if (diferencia.compareTo(BigDecimal.ZERO) > 0) {
            return TipoMovimiento.AJUSTE_ENTRADA;
        } else {
            return TipoMovimiento.AJUSTE_SALIDA;
        }
    }

    public List<AjusteInventarioResponseDto> listarAjustesPorSucursal(Long sucursalId) {
        return ajusteInventarioRepository.findBySucursalId(sucursalId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<AjusteInventarioResponseDto> listarAjustesPorProducto(Long productoId) {
        return ajusteInventarioRepository.findByProductoId(productoId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AjusteInventarioResponseDto mapToResponse(AjusteInventario ajuste) {
        return new AjusteInventarioResponseDto(
                ajuste.getId(),
                ajuste.getProducto().getId(),
                ajuste.getProducto().getNombreProducto(),
                ajuste.getProducto().getCodigoBarras(),
                ajuste.getSucursal().getId(),
                ajuste.getSucursal().getNombreSucursal(),
                ajuste.getStockAnterior(),
                ajuste.getStockNuevo(),
                ajuste.getDiferencia(),
                ajuste.getTipoAjuste(),
                ajuste.getMotivo(),
                ajuste.getObservaciones(),
                ajuste.getUsuario().getId(),
                ajuste.getUsuario().getNombre() + " " + ajuste.getUsuario().getApellido(),
                ajuste.getFechaAjuste(),
                ajuste.getCreatedAt()
        );
    }
}