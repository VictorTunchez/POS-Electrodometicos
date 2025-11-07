package pos.api.domain.inventario.movimientos;

import jakarta.persistence.*;
import lombok.*;
import pos.api.domain.producto.Producto;
import pos.api.domain.sucursal.Sucursal;
import pos.api.domain.usuario.Usuario;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "movimientos_inventario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimiento", nullable = false)
    private TipoMovimiento tipoMovimiento;

    @Column(name = "cantidad", nullable = false, precision = 15, scale = 4)
    private BigDecimal cantidad;

    @Column(name = "stock_anterior", nullable = false, precision = 15, scale = 4)
    private BigDecimal stockAnterior;

    @Column(name = "stock_posterior", nullable = false, precision = 15, scale = 4)
    private BigDecimal stockPosterior;

    @Column(name = "fecha_movimiento", nullable = false)
    private Instant fechaMovimiento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "referencia_id")
    private Long referenciaId;

    @Column(name = "referencia_tipo")
    private String referenciaTipo; // AJUSTE, COMPRA, VENTA, etc.

    @Column(name = "observaciones")
    private String observaciones;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        fechaMovimiento = Instant.now();
    }
}

