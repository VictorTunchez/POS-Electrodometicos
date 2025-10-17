package pos.api.domain.listaPrecios;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pos.api.domain.producto.IProductoRepository;
import pos.api.domain.producto.Producto;
import pos.api.domain.unidadMedida.IUnidadMedidaRepository;
import pos.api.domain.unidadMedida.TipoUnidad;
import pos.api.domain.unidadMedida.UnidadMedida;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CalculadoraPreciosService {

    private final IProductoRepository productoRepository;
    private final IUnidadMedidaRepository unidadMedidaRepository;

    public BigDecimal calcularPrecioSugerido(Long productoId, TipoPrecio tipoPrecio, BigDecimal porcentajeMargen) {
        Producto producto = productoRepository.findByIdAndDeletedAtIsNull(productoId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        BigDecimal costoPromedio = producto.getCostoPromedio();
        if (costoPromedio == null || BigDecimal.ZERO.equals(costoPromedio)) {
            return BigDecimal.ZERO;
        }

        // Aplicar margen básico
        BigDecimal margenDecimal = porcentajeMargen.divide(new BigDecimal(100), 4, RoundingMode.HALF_UP);
        BigDecimal precioBase = costoPromedio.multiply(BigDecimal.ONE.add(margenDecimal));

        // Ajustar según tipo de precio
        switch (tipoPrecio) {
            case MINORISTA:
                return redondearPrecio(precioBase);
            case MAYORISTA:
                // 10% menos para mayoreo
                return redondearPrecio(precioBase.multiply(new BigDecimal("0.90")));
            case OFERTA:
                // 15% menos para ofertas
                return redondearPrecio(precioBase.multiply(new BigDecimal("0.85")));
            case COSTO:
                return costoPromedio; // Precio de costo sin margen
            default:
                return redondearPrecio(precioBase);
        }
    }

    public BigDecimal calcularPrecioPorUnidad(Long productoId, Long unidadMedidaId,
                                              Integer cantidad, TipoPrecio tipoPrecio) {
        Producto producto = productoRepository.findByIdAndDeletedAtIsNull(productoId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        UnidadMedida unidadMedida = unidadMedidaRepository.findById(unidadMedidaId)
                .orElseThrow(() -> new IllegalArgumentException("Unidad de medida no encontrada"));

        // Validar que la unidad sea compatible con el producto
        validarUnidadCompatible(producto, unidadMedida, tipoPrecio);

        // Obtener precio base en unidad de venta
        BigDecimal precioBaseUnd = calcularPrecioSugerido(productoId, tipoPrecio, producto.getMargenDefault());

        // Calcular factor de conversión
        BigDecimal factorConversion = calcularFactorConversion(producto, unidadMedida);

        // Calcular precio final
        BigDecimal precioPorUnidad = precioBaseUnd.multiply(factorConversion);
        BigDecimal precioTotal = precioPorUnidad.multiply(new BigDecimal(cantidad));

        return redondearPrecio(precioTotal);
    }

    public List<PrecioProducto> generarPreciosAutomaticos(Producto producto, BigDecimal porcentajeMargen) {
        List<PrecioProducto> precios = new ArrayList<>();

        // Precio MINORISTA siempre en Unidad de VENTA
        BigDecimal precioMinorista = calcularPrecioSugerido(producto.getId(), TipoPrecio.MINORISTA, porcentajeMargen);
        precios.add(crearPrecioProducto(producto, producto.getUnidadMedida(), TipoPrecio.MINORISTA, precioMinorista, 1));

        // Precio COSTO en unidad de venta
        precios.add(crearPrecioProducto(producto, producto.getUnidadMedida(), TipoPrecio.COSTO,
                producto.getCostoPromedio() != null ? producto.getCostoPromedio() : BigDecimal.ZERO, 1));

        // Precio MAYORISTA solo si existe unidad de compra
        if (producto.getUnidadCompra() != null && producto.getFactorConversion() != null) {
            BigDecimal precioMayoreo = calcularPrecioSugerido(producto.getId(), TipoPrecio.MAYORISTA, porcentajeMargen);
            // El precio mayorista es por unidad de COMPRA, no necesita multiplicar por factor
            precios.add(crearPrecioProducto(producto, producto.getUnidadCompra(), TipoPrecio.MAYORISTA,
                    precioMayoreo, producto.getFactorConversion().intValue()));
        }

        return precios;
    }

    public BigDecimal calcularMargenGanancia(BigDecimal costoPromedio, BigDecimal precioVenta) {
        if (costoPromedio == null || costoPromedio.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal ganancia = precioVenta.subtract(costoPromedio);
        BigDecimal margen = ganancia.divide(costoPromedio, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal(100));

        return margen.setScale(2, RoundingMode.HALF_UP);
    }

    private void validarUnidadCompatible(Producto producto, UnidadMedida unidadMedida, TipoPrecio tipoPrecio) {
        // Para venta minorista, solo unidades de VENTA
        if (tipoPrecio == TipoPrecio.MINORISTA || tipoPrecio == TipoPrecio.OFERTA) {
            if (unidadMedida.getTipo() != TipoUnidad.VENTA && unidadMedida.getTipo() != TipoUnidad.AMBOS) {
                throw new IllegalArgumentException("La unidad debe ser de tipo VENTA para precios minoristas");
            }
        }

        // Para mayoreo, solo unidades de COMPRA
        if (tipoPrecio == TipoPrecio.MAYORISTA) {
            if (unidadMedida.getTipo() != TipoUnidad.COMPRA && unidadMedida.getTipo() != TipoUnidad.AMBOS) {
                throw new IllegalArgumentException("La unidad debe ser de tipo COMPRA para precios mayoristas");
            }
        }
    }

    private BigDecimal calcularFactorConversion(Producto producto, UnidadMedida unidadMedida) {
        // Si es la misma unidad, factor 1
        if (unidadMedida.getId().equals(producto.getUnidadMedida().getId())) {
            return BigDecimal.ONE;
        }

        // Si es unidad de compra, usar factor de conversión
        if (producto.getUnidadCompra() != null &&
                unidadMedida.getId().equals(producto.getUnidadCompra().getId())) {
            return producto.getFactorConversion();
        }

        throw new IllegalArgumentException("No se puede convertir entre las unidades especificadas");
    }

    private PrecioProducto crearPrecioProducto(Producto producto, UnidadMedida unidadMedida,
                                               TipoPrecio tipoPrecio, BigDecimal precio, Integer minimoCantidad) {
        PrecioProducto precioProducto = new PrecioProducto();
        precioProducto.setProducto(producto);
        precioProducto.setUnidadMedida(unidadMedida);
        precioProducto.setTipoPrecio(tipoPrecio);
        precioProducto.setPrecio(precio);
        precioProducto.setMinimoCantidad(minimoCantidad);
        precioProducto.setActivo(true);
        return precioProducto;
    }

    private BigDecimal redondearPrecio(BigDecimal precio) {
        if (precio == null || BigDecimal.ZERO.equals(precio)) {
            return BigDecimal.ZERO;
        }

        // Estrategia de redondeo psicológico: terminar en .95 o .99
        BigDecimal entero = precio.setScale(0, RoundingMode.FLOOR);
        BigDecimal decimal = precio.subtract(entero);

        if (decimal.compareTo(new BigDecimal("0.50")) < 0) {
            return entero.add(new BigDecimal("0.95"));
        } else {
            return entero.add(new BigDecimal("0.99"));
        }
    }
}