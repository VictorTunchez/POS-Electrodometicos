package pos.api.domain.venta;

import jakarta.persistence.*;
import lombok.*;
import pos.api.domain.cliente.Cliente;
import pos.api.domain.sucursal.Sucursal;
import pos.api.domain.usuario.Usuario;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_factura", nullable = false, length = 50, unique = true)
    private String numeroFactura;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente; // Puede ser null para ventas anónimas

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario; // Vendedor

    @Column(name = "fecha_venta", nullable = false)
    private Instant fechaVenta;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 20)
    private EstadoVenta estado = EstadoVenta.PENDIENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_venta", length = 20)
    private TipoVenta tipoVenta; // CONTADO, CREDITO

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pago", length = 20)
    private FormaPago formaPago; // EFECTIVO, TARJETA, MIXTO

    // Campos de pago con tarjeta (opcional)
    @Column(name = "ultimos_digitos_tarjeta", length = 4)
    private String ultimosDigitosTarjeta;

    @Column(name = "tipo_tarjeta", length = 20)
    private String tipoTarjeta; // VISA, MASTERCARD, etc.

    @Column(name = "cantidad_cuotas")
    private Integer cantidadCuotas; // Solo para crédito

    // Totales
    @Column(name = "subtotal", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "impuesto", nullable = false, precision = 12, scale = 2)
    private BigDecimal impuesto = BigDecimal.ZERO;

    @Column(name = "descuento", nullable = false, precision = 12, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(name = "total", nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    // Para integración con Stripe
    @Column(name = "stripe_session_id", length = 100)
    private String stripeSessionId;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetalleVenta> detalles = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        if (fechaVenta == null) {
            fechaVenta = Instant.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
