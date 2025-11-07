package pos.api.domain.venta;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pos.api.domain.cliente.Cliente;
import pos.api.domain.cliente.IClienteRepository;
import pos.api.domain.inventario.InventarioService;
import pos.api.domain.inventario.movimientos.IMovimientoInventarioRepository;
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
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class VentaService {

    private final IVentaRepository ventaRepository;
    private final IDetalleVentaRepository detalleVentaRepository;
    private final IClienteRepository clienteRepository;
    private final ISucursalRepository sucursalRepository;
    private final IUsuarioRepository usuarioRepository;
    private final IProductoRepository productoRepository;
    private final IUnidadMedidaRepository unidadMedidaRepository;
    private final InventarioService inventarioService;
    private final StripeService stripeService;
    private final IMovimientoInventarioRepository movimientoInventarioRepository;

    @Transactional
    public VentaResponseDto crearVenta(VentaRequestDto dto, Long usuarioId) {
        Cliente cliente = null;
        if (dto.clienteId() != null) {
            cliente = clienteRepository.findByIdAndDeletedAtIsNull(dto.clienteId())
                    .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado con ID: " + dto.clienteId()));
        }

        // Validar sucursal
        Sucursal sucursal = sucursalRepository.findById(dto.sucursalId())
                .orElseThrow(() -> new IllegalArgumentException("Sucursal no encontrada con ID: " + dto.sucursalId()));

        // Validar usuario (vendedor) - AHORA USAMOS EL usuarioId DEL PARÁMETRO
        Usuario usuario = usuarioRepository.findByIdAndDeletedAtIsNull(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + usuarioId));

        // Generar número de factura único
        String numeroFactura = generarNumeroFactura();

        // Crear venta
        Venta venta = new Venta();
        venta.setNumeroFactura(numeroFactura);
        venta.setCliente(cliente);
        venta.setSucursal(sucursal);
        venta.setUsuario(usuario);
        venta.setFechaVenta(Instant.now());
        venta.setTipoVenta(dto.tipoVenta());
        venta.setFormaPago(dto.formaPago());
        venta.setObservaciones(dto.observaciones());
        venta.setEstado(EstadoVenta.PENDIENTE);

        // Procesar detalles
        List<DetalleVenta> detalles = procesarDetallesVenta(venta, dto.detalles());
        venta.setDetalles(detalles);

        // Calcular totales
        calcularTotalesVenta(venta);

        Venta ventaGuardada = ventaRepository.save(venta);

        // Si la venta es con tarjeta, se crea la sesión de Stripe
        if (dto.formaPago() == FormaPago.TARJETA) {
            PagoResponseDto pagoResponse = stripeService.crearSesionPagoVenta(ventaGuardada);
            ventaGuardada.setStripeSessionId(pagoResponse.sessionId());
            ventaRepository.save(ventaGuardada);

            return mapToResponse(ventaGuardada, pagoResponse.sessionUrl());
        }

        // Si es efectivo, completar inmediatamente CON REGISTRO DE MOVIMIENTOS
        if (dto.formaPago() == FormaPago.EFECTIVO) {
            ventaGuardada.setEstado(EstadoVenta.COMPLETADA);
            actualizarInventario(ventaGuardada, false, usuarioId); // PASA usuarioId
            ventaGuardada = ventaRepository.save(ventaGuardada);
        }

        return mapToResponse(ventaGuardada);
    }

    private List<DetalleVenta> procesarDetallesVenta(Venta venta, List<DetalleVentaRequestDto> detallesDto) {
        List<DetalleVenta> detalles = new ArrayList<>();

        for (DetalleVentaRequestDto detalleDto : detallesDto) {
            // Validar producto
            Producto producto = productoRepository.findByIdAndDeletedAtIsNull(detalleDto.productoId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + detalleDto.productoId()));

            // Validar unidad de medida
            UnidadMedida unidadMedida = unidadMedidaRepository.findById(detalleDto.unidadMedidaId())
                    .orElseThrow(() -> new IllegalArgumentException("Unidad de medida no encontrada con ID: " + detalleDto.unidadMedidaId()));

            // Validar que la unidad de medida sea de tipo VENTA o AMBOS
            if (unidadMedida.getTipo() == TipoUnidad.COMPRA) {
                throw new IllegalArgumentException(
                        "No se permite registrar ventas con la unidad '" + unidadMedida.getNombre() + "' (" + unidadMedida.getAbreviatura() + ")"
                );
            }

            // Validar que la unidad sea compatible con el producto
            if (!esUnidadCompatible(producto, unidadMedida)) {
                throw new IllegalArgumentException(
                        "Unidad inválida. Permitidas: " + producto.getUnidadMedida().getNombre() +
                                (producto.getUnidadCompra() != null ? " o " + producto.getUnidadCompra().getNombre() : "")
                );
            }

            // Validar stock disponible (solo si la venta se completará inmediatamente)
            if (venta.getFormaPago() == FormaPago.EFECTIVO) {
                validarStockDisponible(producto, venta.getSucursal(), detalleDto.cantidad(), unidadMedida);
            }

            DetalleVenta detalle = new DetalleVenta();
            detalle.setVenta(venta);
            detalle.setProducto(producto);
            detalle.setUnidadMedida(unidadMedida);
            detalle.setCantidad(detalleDto.cantidad());
            detalle.setPrecioUnitario(detalleDto.precioUnitario());
            detalle.setImpuesto(detalleDto.impuesto() != null ? detalleDto.impuesto() : BigDecimal.ZERO);
            detalle.setDescuento(detalleDto.descuento() != null ? detalleDto.descuento() : BigDecimal.ZERO);

            // Calcular subtotal y total manualmente (por si no se dispara el @PrePersist)
            BigDecimal subtotal = detalle.getCantidad().multiply(detalle.getPrecioUnitario());
            BigDecimal total = subtotal.add(detalle.getImpuesto()).subtract(detalle.getDescuento());

            detalle.setSubtotal(subtotal);
            detalle.setTotal(total);

            detalles.add(detalle);
        }

        return detalles;
    }

    private boolean esUnidadCompatible(Producto producto, UnidadMedida unidadMedida) {
        // Siempre es compatible si es la unidad base
        if (unidadMedida.getId().equals(producto.getUnidadMedida().getId())) {
            return true;
        }

        // Es compatible si es la unidad de compra y es de tipo AMBOS
        if (producto.getUnidadCompra() != null &&
                unidadMedida.getId().equals(producto.getUnidadCompra().getId()) &&
                unidadMedida.getTipo() != TipoUnidad.COMPRA) {
            return true;
        }

        return false;
    }

    private void validarStockDisponible(Producto producto, Sucursal sucursal, BigDecimal cantidad, UnidadMedida unidadMedida) {
        BigDecimal cantidadEnUnidadesBase = convertirAUnidadBase(producto, cantidad, unidadMedida);
        BigDecimal stockActual = inventarioService.obtenerStockActual(producto.getId(), sucursal.getId());

        if (stockActual.compareTo(cantidadEnUnidadesBase) < 0) {
            throw new IllegalArgumentException(
                    "Stock insuficiente para el producto: " + producto.getNombreProducto() +
                            ". Stock disponible: " + stockActual + " " + producto.getUnidadMedida().getAbreviatura() +
                            ", solicitado: " + cantidadEnUnidadesBase + " " + producto.getUnidadMedida().getAbreviatura()
            );
        }
    }

    private void calcularTotalesVenta(Venta venta) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal impuesto = BigDecimal.ZERO;
        BigDecimal descuento = BigDecimal.ZERO;

        for (DetalleVenta detalle : venta.getDetalles()) {
            subtotal = subtotal.add(detalle.getSubtotal());
            impuesto = impuesto.add(detalle.getImpuesto());
            descuento = descuento.add(detalle.getDescuento());
        }

        venta.setSubtotal(subtotal);
        venta.setImpuesto(impuesto);
        venta.setDescuento(descuento);
        venta.setTotal(subtotal.add(impuesto).subtract(descuento));
    }

    private String generarNumeroFactura() {
        // Lógica para generar número de factura único
        // Puedes implementar tu propia lógica de numeración
        return "FACT-" + Instant.now().toEpochMilli() + "-" + (int)(Math.random() * 1000);
    }

    private void actualizarInventario(Venta venta, boolean esCancelacion, Long usuarioId) {
        // VERIFICACIÓN EXTRA - asegurar que la venta esté COMPLETADA
        if (!esCancelacion && venta.getEstado() != EstadoVenta.COMPLETADA) {
            System.out.println("[INVENTARIO] ERROR: Venta no está COMPLETADA, estado: " + venta.getEstado());
            return;
        }

        System.out.println("[INVENTARIO] Procesando inventario para venta: " + venta.getId() + " (Cancelación: " + esCancelacion + ")");

        for (DetalleVenta detalle : venta.getDetalles()) {
            BigDecimal cantidadEnUnidadesBase = convertirAUnidadBase(
                    detalle.getProducto(),
                    detalle.getCantidad(),
                    detalle.getUnidadMedida()
            );

            // Verificar si ya existe movimiento para este producto
            boolean movimientoExiste = movimientoInventarioRepository
                    .existsByProductoIdAndSucursalIdAndReferenciaTipoAndReferenciaId(
                            detalle.getProducto().getId(),
                            venta.getSucursal().getId(),
                            "VENTA",
                            venta.getId());

            if (movimientoExiste) {
                System.out.println("[INVENTARIO] Movimiento ya existe para producto " + detalle.getProducto().getId() +
                        " en venta " + venta.getId() + ", omitiendo");
                continue;
            }

            if (esCancelacion) {
                inventarioService.actualizarStockPorVenta(
                        detalle.getProducto().getId(),
                        venta.getSucursal().getId(),
                        cantidadEnUnidadesBase.negate(),
                        usuarioId,
                        venta.getId(),
                        "Cancelación de venta #" + venta.getNumeroFactura()
                );
            } else {
                inventarioService.actualizarStockPorVenta(
                        detalle.getProducto().getId(),
                        venta.getSucursal().getId(),
                        cantidadEnUnidadesBase,
                        usuarioId,
                        venta.getId(),
                        "Venta #" + venta.getNumeroFactura()
                );
            }
        }

        System.out.println("[INVENTARIO] Procesamiento completado para venta: " + venta.getId());
    }

    private BigDecimal convertirAUnidadBase(Producto producto, BigDecimal cantidad, UnidadMedida unidadMedida) {
        // Si es la unidad base, no hay conversión
        if (unidadMedida.getId().equals(producto.getUnidadMedida().getId())) {
            return cantidad;
        }

        // Si es unidad de compra, multiplicar por factor de conversión
        // Ejemplo: 5 cajas × factor 5 = 25 unidades
        if (producto.getUnidadCompra() != null &&
                unidadMedida.getId().equals(producto.getUnidadCompra().getId())) {
            if (producto.getFactorConversion() == null || producto.getFactorConversion().compareTo(BigDecimal.ZERO) == 0) {
                throw new IllegalStateException("Factor de conversión no definido para el producto: " + producto.getId());
            }
            return cantidad.multiply(producto.getFactorConversion());
        }

        throw new IllegalArgumentException("No se puede convertir de " + unidadMedida.getNombre() +
                " a " + producto.getUnidadMedida().getNombre());
    }

    @Transactional
    public synchronized VentaResponseDto confirmarPagoStripe(String sessionId) {
        System.out.println("[SYNC] Iniciando confirmación de pago Stripe para session: " + sessionId);

        // VERIFICACIÓN INMEDIATA EN BASE DE DATOS
        Venta venta = ventaRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Venta no encontrada para la sesión de Stripe: " + sessionId));

        System.out.println("[SYNC] Procesando pago Stripe - Venta ID: " + venta.getId() + ", Estado actual: " + venta.getEstado());

        // VERIFICACIÓN TEMPRANA - SI YA ESTÁ COMPLETADA, RETORNAR INMEDIATAMENTE
        if (venta.getEstado() == EstadoVenta.COMPLETADA) {
            System.out.println("🟡 [SYNC] Venta ya completada, retornando sin procesar: " + venta.getId());
            return mapToResponse(venta);
        }

        if (venta.getEstado() != EstadoVenta.PENDIENTE) {
            throw new IllegalStateException("La venta ya ha sido procesada con estado: " + venta.getEstado());
        }

        // Verificar pago
        boolean pagoExitoso = stripeService.verificarPagoExitoso(sessionId);
        if (!pagoExitoso) {
            throw new IllegalStateException("El pago no fue exitoso según Stripe");
        }

        // ACTUALIZAR ESTADO PRIMERO
        System.out.println("[SYNC] Pago verificado exitosamente, actualizando estado a COMPLETADA");
        venta.setEstado(EstadoVenta.COMPLETADA);
        Venta ventaActualizada = ventaRepository.save(venta);

        // HACER FLUSH PARA ASEGURAR PERSISTENCIA INMEDIATA
        ventaRepository.flush();
        System.out.println("[SYNC] Estado guardado en BD para venta: " + ventaActualizada.getId());

        // SOLO ENTONCES actualizar inventario
        System.out.println("[SYNC] Actualizando inventario para venta COMPLETADA: " + ventaActualizada.getId());
        Long usuarioIdParaMovimiento = obtenerUsuarioIdParaMovimientoStripe(ventaActualizada);
        actualizarInventario(ventaActualizada, false, usuarioIdParaMovimiento);

        System.out.println("[SYNC] Venta completada e inventario actualizado: " + ventaActualizada.getId());
        return mapToResponse(ventaActualizada);
    }

    // Metodo auxiliar para obtener usuario en contexto de Stripe
    private Long obtenerUsuarioIdParaMovimientoStripe(Venta venta) {
        try {
            // Intentar obtener el usuario autenticado actual
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() &&
                    authentication.getPrincipal() instanceof Usuario) {
                return ((Usuario) authentication.getPrincipal()).getId();
            }

            // Si no hay usuario autenticado (webhook), usar el usuario que creó la venta
            return venta.getUsuario().getId();

        } catch (Exception e) {
            // Fallback: usar el usuario de la venta
            System.out.println("No se pudo obtener usuario autenticado, usando usuario de la venta: " + e.getMessage());
            return venta.getUsuario().getId();
        }
    }

    // Métodos adicionales para listar ventas, obtener por ID, cancelar, etc.
    @Transactional(readOnly = true)
    public List<VentaResponseDto> listarVentas() {
        return ventaRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public VentaResponseDto obtenerVenta(Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Venta no encontrada con ID: " + id));
        return mapToResponse(venta);
    }

    @Transactional
    public VentaResponseDto cancelarVenta(Long id, Long usuarioId) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Venta no encontrada con ID: " + id));

        System.out.println("Cancelando venta ID: " + id + ", Estado actual: " + venta.getEstado());

        if (venta.getEstado() == EstadoVenta.COMPLETADA) {
            // Solo actualizar inventario si la venta estaba COMPLETADA
            System.out.println("Revertiendo inventario para venta completada: " + id);
            actualizarInventario(venta, true, usuarioId);
        } else {
            System.out.println("🟡 Venta no estaba COMPLETADA, no se revierte inventario: " + id);
        }

        venta.setEstado(EstadoVenta.CANCELADA);
        Venta ventaActualizada = ventaRepository.save(venta);

        System.out.println("Venta cancelada: " + id);
        return mapToResponse(ventaActualizada);
    }

    // Agregar estos métodos al VentaService

    @Transactional(readOnly = true)
    public List<VentaResponseDto> listarVentasPorSucursal(Long sucursalId) {
        return ventaRepository.findBySucursalId(sucursalId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VentaResponseDto> listarVentasPorCliente(Long clienteId) {
        return ventaRepository.findByClienteId(clienteId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VentaResponseDto> listarVentasPorEstado(EstadoVenta estado) {
        return ventaRepository.findByEstado(estado).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VentaResponseDto> listarVentasPorRangoFechas(Instant fechaInicio, Instant fechaFin) {
        return ventaRepository.findByFechaVentaBetween(fechaInicio, fechaFin).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VentaResponseDto> listarVentasPorUsuario(Long usuarioId) {
        return ventaRepository.findByUsuarioId(usuarioId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DetalleVentaResponseDto> obtenerDetallesVenta(Long ventaId) {
        List<DetalleVenta> detalles = detalleVentaRepository.findByVentaId(ventaId);
        return detalles.stream()
                .map(this::mapToDetalleResponse)
                .toList();
    }

    @Transactional
    public VentaResponseDto actualizarVenta(Long id, ActualizarVentaRequestDto dto) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Venta no encontrada con ID: " + id));

        if (venta.getEstado() != EstadoVenta.PENDIENTE) {
            throw new IllegalStateException("Solo se pueden modificar ventas en estado PENDIENTE");
        }

        // Actualizar observaciones
        if (dto.observaciones() != null) {
            venta.setObservaciones(dto.observaciones());
        }

        // Actualizar detalles si se proporcionan
        if (dto.detalles() != null && !dto.detalles().isEmpty()) {
            // Eliminar detalles existentes
            detalleVentaRepository.deleteAll(venta.getDetalles());
            venta.getDetalles().clear();

            // Crear nuevos detalles
            List<DetalleVenta> nuevosDetalles = procesarDetallesVenta(venta, dto.detalles());
            venta.setDetalles(nuevosDetalles);

            // Recalcular totales
            calcularTotalesVenta(venta);
        }

        Venta ventaActualizada = ventaRepository.save(venta);
        return mapToResponse(ventaActualizada);
    }

    @Transactional
    public void eliminarVenta(Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Venta no encontrada con ID: " + id));

        if (venta.getEstado() == EstadoVenta.COMPLETADA) {
            throw new IllegalStateException("No se puede eliminar una venta completada");
        }

        ventaRepository.delete(venta);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obtenerResumenVentasMensual(int año, int mes) {
        YearMonth yearMonth = YearMonth.of(año, mes);
        Instant fechaInicio = yearMonth.atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant fechaFin = yearMonth.atEndOfMonth().atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

        List<Venta> ventasDelMes = ventaRepository.findByFechaVentaBetween(fechaInicio, fechaFin);

        BigDecimal totalVentas = ventasDelMes.stream()
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalVentasCount = ventasDelMes.size();
        long ventasCompletadas = ventasDelMes.stream()
                .filter(v -> v.getEstado() == EstadoVenta.COMPLETADA)
                .count();

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("año", año);
        resumen.put("mes", mes);
        resumen.put("totalVentas", totalVentasCount);
        resumen.put("ventasCompletadas", ventasCompletadas);
        resumen.put("ventasPendientes", totalVentasCount - ventasCompletadas);
        resumen.put("montoTotal", totalVentas);
        resumen.put("ventas", ventasDelMes.stream().map(this::mapToResponse).toList());

        return resumen;
    }

    // Métodos auxiliares para el controlador de pagos
    @Transactional(readOnly = true)
    public Venta obtenerVentaEntity(Long ventaId) {
        return ventaRepository.findById(ventaId)
                .orElseThrow(() -> new IllegalArgumentException("Venta no encontrada con ID: " + ventaId));
    }

    @Transactional
    public void guardarVenta(Venta venta) {
        ventaRepository.save(venta);
    }

    private VentaResponseDto mapToResponse(Venta venta, String stripeSessionUrl) {
        List<DetalleVentaResponseDto> detallesResponse = venta.getDetalles().stream()
                .map(this::mapToDetalleResponse)
                .toList();

        return new VentaResponseDto(
                venta.getId(),
                venta.getNumeroFactura(),
                venta.getCliente() != null ? venta.getCliente().getId() : null,
                venta.getCliente() != null ? venta.getCliente().getNombre() : null,
                venta.getSucursal().getId(),
                venta.getSucursal().getNombreSucursal(),
                venta.getUsuario().getId(),
                venta.getUsuario().getUsername(),
                venta.getFechaVenta(),
                venta.getEstado(),
                venta.getTipoVenta(),
                venta.getFormaPago(),
                venta.getUltimosDigitosTarjeta(),
                venta.getTipoTarjeta(),
                venta.getCantidadCuotas(),
                venta.getSubtotal(),
                venta.getImpuesto(),
                venta.getDescuento(),
                venta.getTotal(),
                venta.getObservaciones(),
                venta.getStripeSessionId(),
                stripeSessionUrl,
                detallesResponse,
                venta.getCreatedAt(),
                venta.getUpdatedAt()
        );
    }

    // Metodo sobrecargado para cuando no hay stripeSessionUrl
    private VentaResponseDto mapToResponse(Venta venta) {
        return mapToResponse(venta, null);
    }

    private DetalleVentaResponseDto mapToDetalleResponse(DetalleVenta detalle) {
        return new DetalleVentaResponseDto(
                detalle.getId(),
                detalle.getProducto().getId(),
                detalle.getProducto().getNombreProducto(),
                detalle.getProducto().getCodigoBarras(),
                detalle.getUnidadMedida().getId(),
                detalle.getUnidadMedida().getNombre(),
                detalle.getUnidadMedida().getAbreviatura(),
                detalle.getCantidad(),
                detalle.getPrecioUnitario(),
                detalle.getSubtotal(),
                detalle.getImpuesto(),
                detalle.getDescuento(),
                detalle.getTotal()
        );
    }
}
