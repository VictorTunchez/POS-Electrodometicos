package pos.api.domain.inventario;

import jakarta.persistence.*;
import lombok.*;
import pos.api.domain.producto.Producto;
import pos.api.domain.sucursal.Sucursal;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
        name = "inventario",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"id_producto", "id_sucursal"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_sucursal", nullable = false)
    private Sucursal sucursal;

    // Usar BigDecimal para conversiones
    @Column(name = "stock_actual", nullable = false, precision = 15, scale = 4)
    private BigDecimal stockActual = BigDecimal.ZERO;

    @Column(name = "stock_minimo", nullable = false, precision = 15, scale = 4)
    private BigDecimal stockMinimo = new BigDecimal(5);

    @Column(name = "fecha_actualizacion")
    private Instant fechaActualizacion;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        fechaActualizacion = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
        fechaActualizacion = Instant.now();
    }

    // METODOS PARA ACTUALIZAR STOCK (SOLO USAR DESDE SERVICIO DE COMPRAS/VENTAS)
    public void agregarStock(BigDecimal cantidad) {
        this.stockActual = this.stockActual.add(cantidad);
        this.fechaActualizacion = Instant.now();
    }

    public void reducirStock(BigDecimal cantidad) {
        if (this.stockActual.compareTo(cantidad) < 0) {
            throw new IllegalStateException("Stock insuficiente. Stock actual: " + stockActual + ", intentando reducir: " + cantidad);
        }
        this.stockActual = this.stockActual.subtract(cantidad);
        this.fechaActualizacion = Instant.now();
    }
}
