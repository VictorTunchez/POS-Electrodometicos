package pos.api.domain.inventario.movimientos;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pos.api.domain.producto.IProductoRepository;
import pos.api.domain.sucursal.ISucursalRepository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MovimientoInventarioService {

    private final IMovimientoInventarioRepository movimientoInventarioRepository;
    private final IProductoRepository productoRepository;
    private final ISucursalRepository sucursalRepository;

    public List<MovimientoInventarioResponseDto> obtenerMovimientosPorProductoYSucursal(Long productoId, Long sucursalId) {
        return movimientoInventarioRepository
                .findByProductoIdAndSucursalIdOrderByFechaMovimientoDesc(productoId, sucursalId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<MovimientoInventarioResponseDto> obtenerMovimientosPorSucursal(Long sucursalId, Instant desde, Instant hasta) {
        if (desde == null) desde = Instant.now().minus(30, ChronoUnit.DAYS);
        if (hasta == null) hasta = Instant.now();

        return movimientoInventarioRepository
                .findBySucursalIdAndFechaMovimientoBetween(sucursalId, desde, hasta)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    public List<MovimientoInventarioResponseDto> obtenerMovimientosPorProducto(Long productoId) {
        return movimientoInventarioRepository
                .findByProductoIdOrderByFechaMovimientoDesc(productoId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private MovimientoInventarioResponseDto mapToResponse(MovimientoInventario movimiento) {
        return new MovimientoInventarioResponseDto(
                movimiento.getId(),
                movimiento.getProducto().getId(),
                movimiento.getProducto().getNombreProducto(),
                movimiento.getSucursal().getId(),
                movimiento.getSucursal().getNombreSucursal(),
                movimiento.getTipoMovimiento(),
                movimiento.getCantidad(),
                movimiento.getStockAnterior(),
                movimiento.getStockPosterior(),
                movimiento.getReferenciaTipo(),
                movimiento.getReferenciaId(),
                movimiento.getObservaciones(),
                movimiento.getUsuario().getId(),
                movimiento.getUsuario().getNombre() + " " + movimiento.getUsuario().getApellido(),
                movimiento.getFechaMovimiento(),
                movimiento.getCreatedAt()
        );
    }
}
