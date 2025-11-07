package pos.api.domain.inventario.traslados;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pos.api.domain.inventario.InventarioService;
import pos.api.domain.producto.IProductoRepository;
import pos.api.domain.producto.Producto;
import pos.api.domain.sucursal.ISucursalRepository;
import pos.api.domain.sucursal.Sucursal;
import pos.api.domain.unidadMedida.IUnidadMedidaRepository;
import pos.api.domain.unidadMedida.TipoUnidad;
import pos.api.domain.unidadMedida.UnidadMedida;
import pos.api.domain.usuario.IUsuarioRepository;
import pos.api.domain.usuario.Usuario;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TrasladoService {

    private final ITrasladoRepository trasladoRepository;
    private final IDetalleTrasladoRepository detalleTrasladoRepository;
    private final IProductoRepository productoRepository;
    private final ISucursalRepository sucursalRepository;
    private final IUsuarioRepository usuarioRepository;
    private final IUnidadMedidaRepository unidadMedidaRepository;
    private final InventarioService inventarioService;

    @Transactional
    public TrasladoResponseDto crearTraslado(TrasladoRequestDto dto, Long usuarioId) {
        // Validar que las sucursales sean diferentes
        if (dto.sucursalOrigenId().equals(dto.sucursalDestinoId())) {
            throw new IllegalArgumentException("La sucursal origen y destino no pueden ser la misma");
        }

        // Validar sucursal origen
        Sucursal sucursalOrigen = sucursalRepository.findById(dto.sucursalOrigenId())
                .orElseThrow(() -> new IllegalArgumentException("Sucursal origen no encontrada con ID: " + dto.sucursalOrigenId()));

        // Validar sucursal destino
        Sucursal sucursalDestino = sucursalRepository.findById(dto.sucursalDestinoId())
                .orElseThrow(() -> new IllegalArgumentException("Sucursal destino no encontrada con ID: " + dto.sucursalDestinoId()));

        // Validar usuario
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + usuarioId));

        // Crear traslado
        Traslado traslado = new Traslado();
        traslado.setSucursalOrigen(sucursalOrigen);
        traslado.setSucursalDestino(sucursalDestino);
        traslado.setUsuario(usuario);
        traslado.setEstado(EstadoTraslado.PENDIENTE);
        traslado.setObservaciones(dto.observaciones());

        // Procesar detalles
        List<DetalleTraslado> detalles = procesarDetallesTraslado(traslado, dto.detalles());
        traslado.setDetalles(detalles);

        Traslado trasladoGuardado = trasladoRepository.save(traslado);

        return mapToResponse(trasladoGuardado);
    }

    private List<DetalleTraslado> procesarDetallesTraslado(Traslado traslado, List<DetalleTrasladoRequestDto> detallesDto) {
        List<DetalleTraslado> detalles = new ArrayList<>();

        for (DetalleTrasladoRequestDto detalleDto : detallesDto) {
            // Validar producto
            Producto producto = productoRepository.findByIdAndDeletedAtIsNull(detalleDto.productoId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + detalleDto.productoId()));

            // Validar unidad de medida
            UnidadMedida unidadMedida = unidadMedidaRepository.findById(detalleDto.unidadMedidaId())
                    .orElseThrow(() -> new IllegalArgumentException("Unidad de medida no encontrada con ID: " + detalleDto.unidadMedidaId()));

            // Validar que la unidad de medida sea compatible con el producto
            if (!esUnidadCompatible(producto, unidadMedida)) {
                throw new IllegalArgumentException(
                        "Unidad inválida para traslado. Unidades permitidas: " +
                                producto.getUnidadMedida().getNombre() + " (venta)" +
                                (producto.getUnidadCompra() != null ?
                                        " o " + producto.getUnidadCompra().getNombre() + " (compra)" : "")
                );
            }

            // Validar stock disponible en sucursal origen
            BigDecimal cantidadEnUnidadesBase = convertirAUnidadBase(producto, detalleDto.cantidad(), unidadMedida);
            BigDecimal stockActual = inventarioService.obtenerStockActual(producto.getId(), traslado.getSucursalOrigen().getId());

            if (stockActual.compareTo(cantidadEnUnidadesBase) < 0) {
                throw new IllegalArgumentException(
                        "Stock insuficiente para el producto: " + producto.getNombreProducto() +
                                ". Stock disponible: " + stockActual + " " + producto.getUnidadMedida().getAbreviatura() +
                                ", solicitado: " + cantidadEnUnidadesBase + " " + producto.getUnidadMedida().getAbreviatura()
                );
            }

            DetalleTraslado detalle = new DetalleTraslado();
            detalle.setTraslado(traslado);
            detalle.setProducto(producto);
            detalle.setUnidadMedida(unidadMedida);
            detalle.setCantidad(detalleDto.cantidad());
            detalle.setCantidadEnUnidadBase(cantidadEnUnidadesBase);

            detalles.add(detalle);
        }

        return detalles;
    }

    private boolean esUnidadCompatible(Producto producto, UnidadMedida unidadMedida) {
        // Lista de unidades permitidas para este producto
        List<Long> unidadesPermitidas = new ArrayList<>();

        // Siempre permitir la unidad base (venta)
        unidadesPermitidas.add(producto.getUnidadMedida().getId());

        // Permitir unidad de compra si existe
        if (producto.getUnidadCompra() != null) {
            unidadesPermitidas.add(producto.getUnidadCompra().getId());
        }

        return unidadesPermitidas.contains(unidadMedida.getId());
    }

    private BigDecimal convertirAUnidadBase(Producto producto, BigDecimal cantidad, UnidadMedida unidadMedida) {
        // Si es la unidad base (venta), no hay conversión
        if (unidadMedida.getId().equals(producto.getUnidadMedida().getId())) {
            return cantidad;
        }

        // Si es unidad de compra, usar factor de conversión
        if (producto.getUnidadCompra() != null &&
                unidadMedida.getId().equals(producto.getUnidadCompra().getId())) {

            if (producto.getFactorConversion() == null) {
                throw new IllegalStateException(
                        "Factor de conversión no definido para el producto: " + producto.getNombreProducto()
                );
            }

            if (producto.getFactorConversion().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalStateException(
                        "Factor de conversión inválido para el producto: " + producto.getNombreProducto()
                );
            }

            return cantidad.multiply(producto.getFactorConversion());
        }

        throw new IllegalArgumentException(
                "Unidad de medida no compatible para conversión: " + unidadMedida.getNombre()
        );
    }

    @Transactional
    public TrasladoResponseDto completarTraslado(Long trasladoId, Long usuarioId) {
        Traslado traslado = trasladoRepository.findById(trasladoId)
                .orElseThrow(() -> new IllegalArgumentException("Traslado no encontrado con ID: " + trasladoId));

        if (traslado.getEstado() != EstadoTraslado.PENDIENTE) {
            throw new IllegalStateException("El traslado ya ha sido procesado con estado: " + traslado.getEstado());
        }

        // Validar usuario que completa el traslado
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + usuarioId));

        // Actualizar inventarios y registrar movimientos
        actualizarInventariosPorTraslado(traslado, usuarioId);

        // Actualizar estado del traslado
        traslado.setEstado(EstadoTraslado.COMPLETADO);
        Traslado trasladoActualizado = trasladoRepository.save(traslado);

        return mapToResponse(trasladoActualizado);
    }

    private void actualizarInventariosPorTraslado(Traslado traslado, Long usuarioId) {
        for (DetalleTraslado detalle : traslado.getDetalles()) {
            // Validar stock nuevamente (por si cambió desde la creación)
            BigDecimal stockActual = inventarioService.obtenerStockActual(
                    detalle.getProducto().getId(),
                    traslado.getSucursalOrigen().getId()
            );

            if (stockActual.compareTo(detalle.getCantidadEnUnidadBase()) < 0) {
                throw new IllegalStateException(
                        "Stock insuficiente para completar el traslado. Producto: " +
                                detalle.getProducto().getNombreProducto() +
                                ". Stock actual: " + stockActual +
                                ", requerido: " + detalle.getCantidadEnUnidadBase()
                );
            }

            // Restar de la sucursal origen (TRASLADO_SALIDA)
            inventarioService.actualizarStockPorTraslado(
                    detalle.getProducto().getId(),
                    traslado.getSucursalOrigen().getId(),
                    detalle.getCantidadEnUnidadBase().negate(), // Negativo para restar
                    usuarioId,
                    traslado.getId(),
                    "Traslado saliente a " + traslado.getSucursalDestino().getNombreSucursal()
            );

            // Sumar a la sucursal destino (TRASLADO_ENTRADA)
            inventarioService.actualizarStockPorTraslado(
                    detalle.getProducto().getId(),
                    traslado.getSucursalDestino().getId(),
                    detalle.getCantidadEnUnidadBase(), // Positivo para sumar
                    usuarioId,
                    traslado.getId(),
                    "Traslado entrante de " + traslado.getSucursalOrigen().getNombreSucursal()
            );
        }
    }

    @Transactional
    public TrasladoResponseDto cancelarTraslado(Long trasladoId, Long usuarioId) {
        Traslado traslado = trasladoRepository.findById(trasladoId)
                .orElseThrow(() -> new IllegalArgumentException("Traslado no encontrado con ID: " + trasladoId));

        if (traslado.getEstado() != EstadoTraslado.PENDIENTE) {
            throw new IllegalStateException("Solo se pueden cancelar traslados en estado PENDIENTE");
        }

        // Validar usuario que cancela el traslado
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + usuarioId));

        traslado.setEstado(EstadoTraslado.CANCELADO);
        Traslado trasladoActualizado = trasladoRepository.save(traslado);

        return mapToResponse(trasladoActualizado);
    }

    @Transactional
    public TrasladoResponseDto rechazarTraslado(Long trasladoId, Long usuarioId, String motivo) {
        Traslado traslado = trasladoRepository.findById(trasladoId)
                .orElseThrow(() -> new IllegalArgumentException("Traslado no encontrado con ID: " + trasladoId));

        if (traslado.getEstado() != EstadoTraslado.PENDIENTE) {
            throw new IllegalStateException("Solo se pueden rechazar traslados en estado PENDIENTE");
        }

        // Validar usuario que rechaza el traslado
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + usuarioId));

        traslado.setEstado(EstadoTraslado.RECHAZADO);
        String observacionesActualizadas = traslado.getObservaciones() != null ?
                traslado.getObservaciones() + " [RECHAZADO: " + motivo + "]" :
                "[RECHAZADO: " + motivo + "]";
        traslado.setObservaciones(observacionesActualizadas);
        Traslado trasladoActualizado = trasladoRepository.save(traslado);

        return mapToResponse(trasladoActualizado);
    }

    // Métodos para listar traslados
    @Transactional(readOnly = true)
    public List<TrasladoResponseDto> listarTraslados() {
        return trasladoRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TrasladoResponseDto obtenerTraslado(Long id) {
        Traslado traslado = trasladoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Traslado no encontrado con ID: " + id));
        return mapToResponse(traslado);
    }

    @Transactional(readOnly = true)
    public List<TrasladoResponseDto> listarTrasladosPorSucursalOrigen(Long sucursalOrigenId) {
        return trasladoRepository.findBySucursalOrigenId(sucursalOrigenId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TrasladoResponseDto> listarTrasladosPorSucursalDestino(Long sucursalDestinoId) {
        return trasladoRepository.findBySucursalDestinoId(sucursalDestinoId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TrasladoResponseDto> listarTrasladosPorEstado(EstadoTraslado estado) {
        return trasladoRepository.findByEstado(estado).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TrasladoResponseDto> listarTrasladosPorUsuario(Long usuarioId) {
        return trasladoRepository.findByUsuarioId(usuarioId).stream()
                .map(this::mapToResponse)
                .toList();
    }

//    @Transactional(readOnly = true)
//    public List<TrasladoResponseDto> listarTrasladosPorSucursalYEstado(Long sucursalId, EstadoTraslado estado) {
//        List<Traslado> traslados = trasladoRepository.findBySucursalOrigenIdAndEstado(sucursalId, estado);
//        traslados.addAll(trasladoRepository.findBySucursalDestinoIdAndEstado(sucursalId, estado));
//
//        return traslados.stream()
//                .distinct()
//                .map(this::mapToResponse)
//                .toList();
//    }
//
//    @Transactional(readOnly = true)
//    public List<TrasladoResponseDto> listarTrasladosRecientes(int dias) {
//        LocalDateTime fechaLimite = LocalDateTime.now().minusDays(dias);
//        return trasladoRepository.findByCreatedAtAfter(fechaLimite).stream()
//                .map(this::mapToResponse)
//                .toList();
//    }

    private TrasladoResponseDto mapToResponse(Traslado traslado) {
        List<DetalleTrasladoResponseDto> detallesResponse = traslado.getDetalles().stream()
                .map(this::mapToDetalleResponse)
                .toList();

        return new TrasladoResponseDto(
                traslado.getId(),
                traslado.getSucursalOrigen().getId(),
                traslado.getSucursalOrigen().getNombreSucursal(),
                traslado.getSucursalDestino().getId(),
                traslado.getSucursalDestino().getNombreSucursal(),
                traslado.getUsuario().getId(),
                traslado.getUsuario().getNombre() + " " + traslado.getUsuario().getApellido(),
                traslado.getFechaTraslado(),
                traslado.getEstado(),
                traslado.getObservaciones(),
                detallesResponse,
                traslado.getCreatedAt(),
                traslado.getUpdatedAt()
        );
    }

    private DetalleTrasladoResponseDto mapToDetalleResponse(DetalleTraslado detalle) {
        return new DetalleTrasladoResponseDto(
                detalle.getId(),
                detalle.getProducto().getId(),
                detalle.getProducto().getNombreProducto(),
                detalle.getProducto().getCodigoBarras(),
                detalle.getUnidadMedida().getId(),
                detalle.getUnidadMedida().getNombre(),
                detalle.getUnidadMedida().getAbreviatura(),
                detalle.getCantidad(),
                detalle.getCantidadEnUnidadBase()
        );
    }

    // Metodo auxiliar para obtener el nombre de la unidad base
    private String obtenerNombreUnidadBase(Producto producto) {
        return producto.getUnidadMedida().getNombre() + " (" + producto.getUnidadMedida().getAbreviatura() + ")";
    }

    // Metodo auxiliar para obtener el nombre de la unidad de compra
    private String obtenerNombreUnidadCompra(Producto producto) {
        if (producto.getUnidadCompra() != null) {
            return producto.getUnidadCompra().getNombre() + " (" + producto.getUnidadCompra().getAbreviatura() + ")";
        }
        return null;
    }
}