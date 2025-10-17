package pos.api.domain.venta;


import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class StripeService {

    private String secretKey = "sk_test_51SFM2pC57XwKRgTNz1RaSJntbOvaMEDZQwVURxvdapi5e3TQerv6dzbZq2fV83bruVjoE6nQq9abIMu8193peSnw00KWAGd5FZ";

    public PagoResponseDto crearSesionPagoVenta(Venta venta) {
        Stripe.apiKey = secretKey;

        try {
            // **CREAR UN LINE ITEM POR CADA PRODUCTO EN LA VENTA**
            List<SessionCreateParams.LineItem> lineItems = venta.getDetalles().stream()
                    .map(detalle -> {
                        // Crear datos del producto para Stripe
                        SessionCreateParams.LineItem.PriceData.ProductData productData =
                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName(detalle.getProducto().getNombreProducto())
                                        //.setDescription(detalle.getProducto().getDescripcion()) // Opcional
                                        .build();

                        // **Convertir precio unitario a centavos (NO el total)**
                        long precioUnitarioEnCentavos = detalle.getPrecioUnitario()
                                .multiply(BigDecimal.valueOf(100))
                                .longValue();

                        SessionCreateParams.LineItem.PriceData priceData =
                                SessionCreateParams.LineItem.PriceData.builder()
                                        .setCurrency("GTQ")
                                        .setUnitAmount(precioUnitarioEnCentavos) // Precio por unidad
                                        .setProductData(productData)
                                        .build();

                        return SessionCreateParams.LineItem.builder()
                                .setPriceData(priceData)
                                .setQuantity(detalle.getCantidad().longValue()) // Cantidad de este producto
                                .build();
                    })
                    .toList();

            SessionCreateParams params =
                    SessionCreateParams.builder()
                            .setMode(SessionCreateParams.Mode.PAYMENT)
                            .setSuccessUrl("http://localhost:5173/panel/ventas?stripe_success=true&session_id={CHECKOUT_SESSION_ID}")
                            .setCancelUrl("http://localhost:5173/panel/ventas?stripe_cancel=true")
                            .addAllLineItem(lineItems)
                            .putMetadata("venta_id", venta.getId().toString())
                            .setCustomerEmail(venta.getCliente() != null ? venta.getCliente().getEmail() : null)
                            .build();

            Session session = Session.create(params);

            return new PagoResponseDto(
                    "SUCCESS",
                    "Sesión de pago creada exitosamente",
                    session.getId(),
                    session.getUrl()
            );

        } catch (StripeException e) {
            throw new RuntimeException("Error al crear sesión de pago en Stripe: " + e.getMessage(), e);
        }
    }

    public boolean verificarPagoExitoso(String sessionId) {
        try {
            Session session = Session.retrieve(sessionId);
            return "paid".equals(session.getPaymentStatus());
        } catch (StripeException e) {
            throw new RuntimeException("Error verificando pago: " + e.getMessage(), e);
        }
    }
}