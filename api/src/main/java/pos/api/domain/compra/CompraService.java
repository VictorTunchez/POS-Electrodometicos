package pos.api.domain.compra;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pos.api.domain.inventario.InventarioService;
import pos.api.domain.listaPrecios.CalculadoraPreciosService;
import pos.api.domain.listaPrecios.IPrecioProductoRepository;
import pos.api.domain.listaPrecios.PrecioProducto;
import pos.api.domain.producto.IProductoRepository;
import pos.api.domain.producto.Producto;
import pos.api.domain.proveedor.IProveedorRepository;
import pos.api.domain.proveedor.Proveedor;
import pos.api.domain.sucursal.ISucursalRepository;
import pos.api.domain.sucursal.Sucursal;
import pos.api.domain.unidadMedida.IUnidadMedidaRepository;
import pos.api.domain.unidadMedida.TipoUnidad;
import pos.api.domain.unidadMedida.UnidadMedida;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CompraService {

    private final ICompraRepository compraRepository;
    private final IDetalleCompraRepository detalleCompraRepository;
    private final IProveedorRepository proveedorRepository;
    private final ISucursalRepository sucursalRepository;
    private final IProductoRepository productoRepository;
    private final IUnidadMedidaRepository unidadMedidaRepository;
    private final InventarioService inventarioService;
    private final IPrecioProductoRepository precioProductoRepository;
    private final CalculadoraPreciosService calculadoraPreciosService;

    @Transactional
    public CompraResponseDto registrarCompra(CompraRequestDto dto) {
        // Validar proveedor
        Proveedor proveedor = proveedorRepository.findByIdAndDeletedAtIsNull(dto.proveedorId())
                .orElseThrow(() -> new IllegalArgumentException("Proveedor no encontrado con ID: " + dto.proveedorId()));

        // Validar sucursal
        Sucursal sucursal = sucursalRepository.findById(dto.sucursalId())
                .orElseThrow(() -> new IllegalArgumentException("Sucursal no encontrada con ID: " + dto.sucursalId()));

        // Validar número de factura único
        if (compraRepository.findByNumeroFactura(dto.numeroFactura()).isPresent()) {
            throw new IllegalStateException("Ya existe una compra con el número de factura: " + dto.numeroFactura());
        }

        // Crear compra
        Compra compra = new Compra();
        compra.setNumeroFactura(dto.numeroFactura());
        compra.setNumeroControl(dto.numeroControl());
        compra.setProveedor(proveedor);
        compra.setSucursal(sucursal);
        compra.setFechaCompra(dto.fechaCompra() != null ? dto.fechaCompra() : Instant.now());
        compra.setFechaRecepcion(dto.fechaRecepcion());
        compra.setObservaciones(dto.observaciones());
        compra.setEstado(EstadoCompra.PENDIENTE);

        // Procesar detalles
        List<DetalleCompra> detalles = procesarDetallesCompra(compra, dto.detalles());
        compra.setDetalles(detalles);

        // Calcular totales
        calcularTotalesCompra(compra);

        Compra compraGuardada = compraRepository.save(compra);

        // Si la compra está recibida al crearse, procesar recepción
        if (dto.fechaRecepcion() != null) {
            return recibirCompra(compraGuardada.getId());
        }

        return mapToResponse(compraGuardada);
    }

    @Transactional
    private void actualizarCostosProductos(Compra compra) {
        for (DetalleCompra detalle : compra.getDetalles()) {
            Producto producto = detalle.getProducto();

            //  Convertir costo y cantidad a unidad base
            BigDecimal costoUnitarioBase = convertirCostoAUnidadBase(
                    producto,
                    detalle.getCostoUnitario(),
                    detalle.getUnidadMedida()
            );

            BigDecimal cantidadBase = convertirAUnidadBase(
                    producto,
                    detalle.getCantidad(),
                    detalle.getUnidadMedida()
            );

            // Actualizar último costo (en unidad base)
            producto.setUltimoCosto(costoUnitarioBase);

            // Obtener stock actual EN UNIDADES BASE (sin incluir esta compra)
            BigDecimal stockActual = inventarioService.obtenerStockActual(
                    producto.getId(),
                    compra.getSucursal().getId()
            );

            // Calcular stock anterior EXCLUYENDO lo que ya se recibió de esta compra
            BigDecimal cantidadYaRecibidaBase = convertirAUnidadBase(
                    producto,
                    detalle.getCantidadRecibida(),
                    detalle.getUnidadMedida()
            );

            BigDecimal stockAnterior = stockActual.subtract(cantidadYaRecibidaBase);

            // Calcular nuevo costo promedio
            if (stockAnterior.compareTo(BigDecimal.ZERO) <= 0) {
                // Si no hay stock anterior, el costo promedio es el costo actual
                producto.setCostoPromedio(costoUnitarioBase);
            } else {
                // Costo promedio ponderado
                BigDecimal costoPromedioActual = producto.getCostoPromedio() != null
                        ? producto.getCostoPromedio()
                        : BigDecimal.ZERO;

                BigDecimal valorInventarioAnterior = stockAnterior.multiply(costoPromedioActual);
                BigDecimal valorNuevaCompra = cantidadBase.multiply(costoUnitarioBase);
                BigDecimal nuevoStockTotal = stockAnterior.add(cantidadBase);

                BigDecimal nuevoCostoPromedio = valorInventarioAnterior
                        .add(valorNuevaCompra)
                        .divide(nuevoStockTotal, 2, RoundingMode.HALF_UP);

                producto.setCostoPromedio(nuevoCostoPromedio);
            }

            // Guardar cambios
            productoRepository.save(producto);

            // Recalcular precios
            recalcularPreciosProducto(producto);
        }
    }

    //  Conversión de COSTO a unidad base
    private BigDecimal convertirCostoAUnidadBase(Producto producto, BigDecimal costoUnitario, UnidadMedida unidadMedida) {
        // Si es la unidad base, no hay conversión
        if (unidadMedida.getId().equals(producto.getUnidadMedida().getId())) {
            return costoUnitario;
        }

        // Si es unidad de compra, dividir por el factor de conversión
        // Ejemplo: Si costo por caja = 500 y factor = 5, entonces costo por unidad = 100
        if (producto.getUnidadCompra() != null &&
                unidadMedida.getId().equals(producto.getUnidadCompra().getId())) {
            if (producto.getFactorConversion() == null || producto.getFactorConversion().compareTo(BigDecimal.ZERO) == 0) {
                throw new IllegalStateException("Factor de conversión no definido para el producto: " + producto.getId());
            }
            return costoUnitario.divide(producto.getFactorConversion(), 2, RoundingMode.HALF_UP);
        }

        throw new IllegalArgumentException("No se puede convertir el costo de " + unidadMedida.getNombre() +
                " a " + producto.getUnidadMedida().getNombre());
    }

    //  Conversión de CANTIDAD a unidad base
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
    private void recalcularPreciosProducto(Producto producto) {
        try {
            if (producto.getCostoPromedio() == null || producto.getCostoPromedio().compareTo(BigDecimal.ZERO) <= 0) {
                return;
            }

            List<PrecioProducto> nuevosPrecios = calculadoraPreciosService.generarPreciosAutomaticos(
                    producto, producto.getMargenDefault());

            for (PrecioProducto nuevo : nuevosPrecios) {
                Optional<PrecioProducto> existente = precioProductoRepository.findByProductoIdAndTipoPrecioAndActivoTrue(producto.getId(), nuevo.getTipoPrecio());

                if (existente.isPresent()) {
                    PrecioProducto precioExistente = existente.get();
                    precioExistente.setPrecio(nuevo.getPrecio());
                    precioExistente.setActivo(true);
                    precioProductoRepository.save(precioExistente);
                } else {
                    precioProductoRepository.save(nuevo);
                }
            }

        } catch (Exception e) {
            throw new IllegalArgumentException("No se pudieron recalcular los precios para el producto " + producto.getId());
        }
    }

    @Transactional
    public CompraResponseDto recibirCompra(Long compraId) {
        Compra compra = compraRepository.findById(compraId)
                .orElseThrow(() -> new IllegalArgumentException("Compra no encontrada con ID: " + compraId));

        if (compra.getEstado() == EstadoCompra.RECIBIDA) {
            throw new IllegalStateException("La compra ya está recibida");
        }

        if (compra.getEstado() == EstadoCompra.CANCELADA) {
            throw new IllegalStateException("No se puede recibir una compra cancelada");
        }

        // 1. Primero actualizar el inventario
        for (DetalleCompra detalle : compra.getDetalles()) {
            BigDecimal cantidadEnUnidadesBase = convertirAUnidadBase(
                    detalle.getProducto(),
                    detalle.getCantidad(),
                    detalle.getUnidadMedida()
            );

            inventarioService.actualizarStockPorCompra(
                    detalle.getProducto().getId(),
                    compra.getSucursal().getId(),
                    cantidadEnUnidadesBase
            );

            // Marcar detalle como recibido
            detalle.setCantidadRecibida(detalle.getCantidad());
        }

        // 2. Luego actualizar costos y precios
        actualizarCostosProductos(compra);

        // 3. Finalmente actualizar estado
        compra.setEstado(EstadoCompra.RECIBIDA);
        compra.setFechaRecepcion(Instant.now());

        Compra compraActualizada = compraRepository.save(compra);
        return mapToResponse(compraActualizada);
    }

    private List<DetalleCompra> procesarDetallesCompra(Compra compra, List<DetalleCompraRequestDto> detallesDto) {
        List<DetalleCompra> detalles = new ArrayList<>();

        for (DetalleCompraRequestDto detalleDto : detallesDto) {
            // Validar producto
            Producto producto = productoRepository.findByIdAndDeletedAtIsNull(detalleDto.productoId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + detalleDto.productoId()));

            // Validar unidad de medida
            UnidadMedida unidadMedida = unidadMedidaRepository.findById(detalleDto.unidadMedidaId())
                    .orElseThrow(() -> new IllegalArgumentException("Unidad de medida no encontrada con ID: " + detalleDto.unidadMedidaId()));

            // REGLA: no se permiten compras en unidad (UND)
            if (unidadMedida.getTipo() == TipoUnidad.VENTA) {
                throw new IllegalArgumentException(
                        "No se permite registrar compras con la unidad '" + unidadMedida.getNombre() + "' (" + unidadMedida.getAbreviatura() + ")"
                );
            }

            if (!esUnidadCompatible(producto, unidadMedida)) {
                throw new IllegalArgumentException(
                        "Unidad inválida. Permitidas: " + producto.getUnidadMedida().getNombre() +
                                (producto.getUnidadCompra() != null ? " o " + producto.getUnidadCompra().getNombre() : "")
                );
            }

            DetalleCompra detalle = new DetalleCompra();
            detalle.setCompra(compra);
            detalle.setProducto(producto);
            detalle.setUnidadMedida(unidadMedida);

            // Asegurar que NINGÚN BigDecimal sea null - usar valores por defecto
            detalle.setCantidad(detalleDto.cantidad() != null ? detalleDto.cantidad() : BigDecimal.ZERO);
            detalle.setCostoUnitario(detalleDto.costoUnitario() != null ? detalleDto.costoUnitario() : BigDecimal.ZERO);
            detalle.setImpuesto(detalleDto.impuesto() != null ? detalleDto.impuesto() : BigDecimal.ZERO);
            detalle.setDescuento(detalleDto.descuento() != null ? detalleDto.descuento() : BigDecimal.ZERO);

            // Calcular subtotal y total manualmente
            BigDecimal subtotal = detalle.getCantidad().multiply(detalle.getCostoUnitario());
            BigDecimal total = subtotal.add(detalle.getImpuesto()).subtract(detalle.getDescuento());

            detalle.setSubtotal(subtotal);
            detalle.setTotal(total);
            detalle.setCantidadRecibida(BigDecimal.ZERO); // inicializar

            detalles.add(detalle);
        }

        return detalles;
    }


    private boolean esUnidadCompatible(Producto producto, UnidadMedida unidadMedida) {
        // Siempre es compatible si es la unidad base
        if (unidadMedida.getId().equals(producto.getUnidadMedida().getId())) {
            return true;
        }

        // Es compatible si es la unidad de compra
        if (producto.getUnidadCompra() != null &&
                unidadMedida.getId().equals(producto.getUnidadCompra().getId())) {
            return true;
        }

        return false;
    }

    private void calcularTotalesCompra(Compra compra) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal impuesto = BigDecimal.ZERO;
        BigDecimal descuento = BigDecimal.ZERO;

        for (DetalleCompra detalle : compra.getDetalles()) {
            subtotal = subtotal.add(detalle.getSubtotal());
            impuesto = impuesto.add(detalle.getImpuesto());
            descuento = descuento.add(detalle.getDescuento());
        }

        compra.setSubtotal(subtotal);
        compra.setImpuesto(impuesto);
        compra.setDescuento(descuento);
        compra.setTotal(subtotal.add(impuesto).subtract(descuento));
    }

    // Métodos adicionales para listar compras, obtener por ID, etc.
    public List<CompraResponseDto> listarCompras() {
        return compraRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CompraResponseDto obtenerCompra(Long id) {
        Compra compra = compraRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Compra no encontrada con ID: " + id));
        return mapToResponse(compra);
    }

    @Transactional
    public CompraResponseDto recibirCompraParcial(Long compraId, List<DetalleRecepcionRequestDto> detallesRecepcion) {
        Compra compra = compraRepository.findById(compraId)
                .orElseThrow(() -> new IllegalArgumentException("Compra no encontrada con ID: " + compraId));

        // Validaciones de estado
        if (compra.getEstado() == EstadoCompra.RECIBIDA) {
            throw new IllegalStateException("La compra ya está completamente recibida");
        }

        if (compra.getEstado() == EstadoCompra.CANCELADA) {
            throw new IllegalStateException("No se puede recibir una compra cancelada");
        }

        // Validar que al menos un detalle tenga cantidad > 0
        boolean algunaRecepcion = detallesRecepcion.stream()
                .anyMatch(dto -> dto.cantidadRecibida().compareTo(BigDecimal.ZERO) > 0);

        if (!algunaRecepcion) {
            throw new IllegalArgumentException("Debe recibir al menos una cantidad mayor a 0");
        }

        // 1. Validar y preparar los detalles ANTES de cualquier actualización
        Map<Long, DetalleCompra> detallesMap = compra.getDetalles().stream()
                .collect(Collectors.toMap(DetalleCompra::getId, Function.identity()));

        List<RecepcionValida> recepcionesValidas = new ArrayList<>();

        for (DetalleRecepcionRequestDto recepcionDto : detallesRecepcion) {
            DetalleCompra detalle = detallesMap.get(recepcionDto.detalleCompraId());
            if (detalle == null) {
                throw new IllegalArgumentException("Detalle de compra no encontrado con ID: " + recepcionDto.detalleCompraId());
            }

            // Validar cantidad recibida
            if (recepcionDto.cantidadRecibida().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("La cantidad recibida no puede ser negativa");
            }

            BigDecimal cantidadPendiente = detalle.getCantidad().subtract(detalle.getCantidadRecibida());
            if (recepcionDto.cantidadRecibida().compareTo(cantidadPendiente) > 0) {
                throw new IllegalArgumentException(
                        String.format("La cantidad recibida (%.4f) no puede ser mayor a la cantidad pendiente (%.4f) para el producto %s",
                                recepcionDto.cantidadRecibida(), cantidadPendiente, detalle.getProducto().getNombreProducto())
                );
            }

            recepcionesValidas.add(new RecepcionValida(detalle, recepcionDto.cantidadRecibida()));
        }

        // 2. ACTUALIZAR COSTOS PRIMERO (más crítico)
        for (RecepcionValida recepcion : recepcionesValidas) {
            if (recepcion.cantidadRecibida.compareTo(BigDecimal.ZERO) > 0) {
                actualizarCostosProductoPorRecepcionParcial(recepcion.detalle, recepcion.cantidadRecibida);
            }
        }

        // 3. LUEGO ACTUALIZAR INVENTARIO
        for (RecepcionValida recepcion : recepcionesValidas) {
            if (recepcion.cantidadRecibida.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal cantidadEnUnidadesBase = convertirAUnidadBase(
                        recepcion.detalle.getProducto(),
                        recepcion.cantidadRecibida,
                        recepcion.detalle.getUnidadMedida()
                );

                inventarioService.actualizarStockPorCompra(
                        recepcion.detalle.getProducto().getId(),
                        compra.getSucursal().getId(),
                        cantidadEnUnidadesBase
                );

                // Actualizar cantidad recibida en el detalle
                recepcion.detalle.setCantidadRecibida(
                        recepcion.detalle.getCantidadRecibida().add(recepcion.cantidadRecibida)
                );
            }
        }

        // 4. Verificar estado final
        boolean completamenteRecibida = compra.getDetalles().stream()
                .allMatch(detalle -> detalle.getCantidadRecibida().compareTo(detalle.getCantidad()) == 0);

        if (completamenteRecibida) {
            compra.setEstado(EstadoCompra.RECIBIDA);
            compra.setFechaRecepcion(Instant.now());
        } else {
            compra.setEstado(EstadoCompra.PARCIALMENTE_RECIBIDA);
            // Solo actualizar fecha de recepción si es la primera vez
            if (compra.getFechaRecepcion() == null) {
                compra.setFechaRecepcion(Instant.now());
            }
        }

        Compra compraActualizada = compraRepository.save(compra);
        return mapToResponse(compraActualizada);
    }

    // Clase auxiliar para validación
    private static class RecepcionValida {
        final DetalleCompra detalle;
        final BigDecimal cantidadRecibida;

        RecepcionValida(DetalleCompra detalle, BigDecimal cantidadRecibida) {
            this.detalle = detalle;
            this.cantidadRecibida = cantidadRecibida;
        }
    }

    // Nuevo metodo para actualizar costos en recepción parcial
    private void actualizarCostosProductoPorRecepcionParcial(DetalleCompra detalle, BigDecimal cantidadRecibida) {
        Producto producto = detalle.getProducto();

        // Convertir a unidades base
        BigDecimal cantidadBase = convertirAUnidadBase(producto, cantidadRecibida, detalle.getUnidadMedida());
        BigDecimal costoUnitarioBase = convertirCostoAUnidadBase(
                producto, detalle.getCostoUnitario(), detalle.getUnidadMedida()
        );

        // Obtener stock actual EXCLUYENDO esta recepción
        BigDecimal stockActual = inventarioService.obtenerStockActual(
                producto.getId(), detalle.getCompra().getSucursal().getId()
        );

        // Calcular nuevo costo promedio
        if (stockActual.compareTo(BigDecimal.ZERO) <= 0) {
            // Si no hay stock anterior, el costo promedio es el costo actual
            producto.setCostoPromedio(costoUnitarioBase);
        } else {
            // Costo promedio ponderado
            BigDecimal costoPromedioActual = producto.getCostoPromedio() != null
                    ? producto.getCostoPromedio()
                    : BigDecimal.ZERO;

            BigDecimal valorInventarioAnterior = stockActual.multiply(costoPromedioActual);
            BigDecimal valorNuevaRecepcion = cantidadBase.multiply(costoUnitarioBase);
            BigDecimal nuevoStockTotal = stockActual.add(cantidadBase);

            BigDecimal nuevoCostoPromedio = valorInventarioAnterior
                    .add(valorNuevaRecepcion)
                    .divide(nuevoStockTotal, 2, RoundingMode.HALF_UP);

            producto.setCostoPromedio(nuevoCostoPromedio);
        }

        // Actualizar último costo
        producto.setUltimoCosto(costoUnitarioBase);
        productoRepository.save(producto);

        // Recalcular precios
        recalcularPreciosProducto(producto);
    }

    @Transactional
    public CompraResponseDto cancelarCompra(Long compraId) {
        Compra compra = compraRepository.findById(compraId)
                .orElseThrow(() -> new IllegalArgumentException("Compra no encontrada con ID: " + compraId));

        if (compra.getEstado() == EstadoCompra.RECIBIDA) {
            throw new IllegalStateException("No se puede cancelar una compra ya recibida");
        }

        if (compra.getEstado() == EstadoCompra.CANCELADA) {
            throw new IllegalStateException("La compra ya está cancelada");
        }

        //  Solo revertir inventario si estaba parcialmente recibida
        if (compra.getEstado() == EstadoCompra.PARCIALMENTE_RECIBIDA) {
            for (DetalleCompra detalle : compra.getDetalles()) {
                if (detalle.getCantidadRecibida().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal cantidadEnUnidadesBase = convertirAUnidadBase(
                            detalle.getProducto(),
                            detalle.getCantidadRecibida(),
                            detalle.getUnidadMedida()
                    );

                    // Revertir el inventario (restar)
                    inventarioService.actualizarStockPorCompra(
                            detalle.getProducto().getId(),
                            compra.getSucursal().getId(),
                            cantidadEnUnidadesBase.negate()
                    );
                }
            }
        }

        compra.setEstado(EstadoCompra.CANCELADA);
        Compra compraActualizada = compraRepository.save(compra);
        return mapToResponse(compraActualizada);
    }

    public List<CompraResponseDto> listarComprasPorSucursal(Long sucursalId) {
        return compraRepository.findBySucursalId(sucursalId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CompraResponseDto> listarComprasPorProveedor(Long proveedorId) {
        return compraRepository.findByProveedorId(proveedorId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CompraResponseDto> listarComprasPorEstado(EstadoCompra estado) {
        return compraRepository.findByEstado(estado).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CompraResponseDto> listarComprasPorRangoFechas(Instant fechaInicio, Instant fechaFin) {
        return compraRepository.findByFechaCompraBetween(fechaInicio, fechaFin).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CompraResponseDto> listarComprasPorProducto(Long productoId) {
        List<DetalleCompra> detalles = detalleCompraRepository.findByProductoId(productoId);
        Set<Long> compraIds = detalles.stream()
                .map(detalle -> detalle.getCompra().getId())
                .collect(Collectors.toSet());

        return compraRepository.findAllById(compraIds).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public CompraResponseDto actualizarCompra(Long id, ActualizarCompraRequestDto dto) {
        Compra compra = compraRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Compra no encontrada con ID: " + id));

        if (compra.getEstado() == EstadoCompra.RECIBIDA || compra.getEstado() == EstadoCompra.CANCELADA) {
            throw new IllegalStateException("No se puede modificar una compra " + compra.getEstado().toString().toLowerCase());
        }

        // Validar número de factura único si cambió
        if (!dto.numeroFactura().equals(compra.getNumeroFactura()) &&
                compraRepository.findByNumeroFactura(dto.numeroFactura()).isPresent()) {
            throw new IllegalStateException("Ya existe una compra con el número de factura: " + dto.numeroFactura());
        }


        if (!dto.proveedorId().equals(compra.getProveedor().getId())) {
            Proveedor proveedor = proveedorRepository.findByIdAndDeletedAtIsNull(dto.proveedorId())
                    .orElseThrow(() -> new IllegalArgumentException("Proveedor no encontrado con ID: " + dto.proveedorId()));
            compra.setProveedor(proveedor);
        }

        if (!dto.sucursalId().equals(compra.getSucursal().getId())) {
            Sucursal sucursal = sucursalRepository.findById(dto.sucursalId())
                    .orElseThrow(() -> new IllegalArgumentException("Sucursal no encontrada con ID: " + dto.sucursalId()));
            compra.setSucursal(sucursal);
        }

        compra.setNumeroFactura(dto.numeroFactura());
        compra.setNumeroControl(dto.numeroControl());
        compra.setFechaCompra(dto.fechaCompra());
        compra.setObservaciones(dto.observaciones());

        // Actualizar los detalles si se proporcionan
        if (dto.detalles() != null && !dto.detalles().isEmpty()) {
            // Eliminar detalles existentes
            detalleCompraRepository.deleteAll(compra.getDetalles());
            compra.getDetalles().clear();

            // Crear nuevos detalles
            List<DetalleCompra> nuevosDetalles = procesarDetallesCompra(compra, dto.detalles());
            compra.setDetalles(nuevosDetalles);

            // Recalcular totales
            calcularTotalesCompra(compra);
        }

        Compra compraActualizada = compraRepository.save(compra);
        return mapToResponse(compraActualizada);
    }

    @Transactional
    public void eliminarCompra(Long id) {
        Compra compra = compraRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Compra no encontrada con ID: " + id));

        if (compra.getEstado() == EstadoCompra.RECIBIDA) {
            throw new IllegalStateException("No se puede eliminar una compra ya recibida");
        }

        compraRepository.delete(compra);
    }

    public List<DetalleCompraResponseDto> obtenerDetallesCompra(Long compraId) {
        List<DetalleCompra> detalles = detalleCompraRepository.findByCompraId(compraId);
        return detalles.stream()
                .map(this::mapToDetalleResponse)
                .toList();
    }

    public Map<String, Object> obtenerResumenComprasMensual(int año, int mes) {
        // Calcular rango de fechas del mes
        YearMonth yearMonth = YearMonth.of(año, mes);
        Instant fechaInicio = yearMonth.atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant fechaFin = yearMonth.atEndOfMonth().atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

        List<Compra> comprasDelMes = compraRepository.findByFechaCompraBetween(fechaInicio, fechaFin);

        BigDecimal totalCompras = comprasDelMes.stream()
                .map(Compra::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalComprasCount = comprasDelMes.size();
        long comprasRecibidas = comprasDelMes.stream()
                .filter(c -> c.getEstado() == EstadoCompra.RECIBIDA)
                .count();

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("año", año);
        resumen.put("mes", mes);
        resumen.put("totalCompras", totalComprasCount);
        resumen.put("comprasRecibidas", comprasRecibidas);
        resumen.put("comprasPendientes", totalComprasCount - comprasRecibidas);
        resumen.put("montoTotal", totalCompras);
        resumen.put("compras", comprasDelMes.stream().map(this::mapToResponse).toList());

        return resumen;
    }

    private CompraResponseDto mapToResponse(Compra compra) {
        List<DetalleCompraResponseDto> detallesResponse = compra.getDetalles().stream()
                .map(this::mapToDetalleResponse)
                .toList();

        return new CompraResponseDto(
                compra.getId(),
                compra.getNumeroFactura(),
                compra.getNumeroControl(),
                compra.getProveedor().getId(),
                compra.getProveedor().getRazonSocial(),
                compra.getSucursal().getId(),
                compra.getSucursal().getNombreSucursal(),
                compra.getFechaCompra(),
                compra.getFechaRecepcion(),
                compra.getEstado(),
                compra.getSubtotal(),
                compra.getImpuesto(),
                compra.getDescuento(),
                compra.getTotal(),
                compra.getObservaciones(),
                detallesResponse,
                compra.getCreatedAt(),
                compra.getUpdatedAt()
        );
    }

    private DetalleCompraResponseDto mapToDetalleResponse(DetalleCompra detalle) {
        return new DetalleCompraResponseDto(
                detalle.getId(),
                detalle.getProducto().getId(),
                detalle.getProducto().getNombreProducto(),
                detalle.getProducto().getCodigoBarras(),
                detalle.getUnidadMedida().getId(),
                detalle.getUnidadMedida().getNombre(),
                detalle.getUnidadMedida().getAbreviatura(),
                detalle.getCantidad(),
                detalle.getCantidadRecibida(),
                detalle.getCostoUnitario(),
                detalle.getSubtotal(),
                detalle.getImpuesto(),
                detalle.getDescuento(),
                detalle.getTotal()
        );
    }
}