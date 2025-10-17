package pos.api.domain.venta;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record VentaResponseDto(
        Long id,
        String numeroFactura,
        Long clienteId,
        String clienteNombre,
        Long sucursalId,
        String sucursalNombre,
        Long usuarioId,
        String usuarioNombre,
        Instant fechaVenta,
        EstadoVenta estado,
        TipoVenta tipoVenta,
        FormaPago formaPago,
        String ultimosDigitosTarjeta,
        String tipoTarjeta,
        Integer cantidadCuotas,
        BigDecimal subtotal,
        BigDecimal impuesto,
        BigDecimal descuento,
        BigDecimal total,
        String observaciones,
        String stripeSessionId,
        //**CAMPO NUEVO: URL para redirigir al checkout de Stripe**
        String stripeSessionUrl,
        List<DetalleVentaResponseDto> detalles,
        Instant createdAt,
        Instant updatedAt
) {}
