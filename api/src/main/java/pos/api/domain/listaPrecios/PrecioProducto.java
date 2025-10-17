package pos.api.domain.listaPrecios;

import jakarta.persistence.*;
import lombok.*;
import pos.api.domain.producto.Producto;
import pos.api.domain.unidadMedida.UnidadMedida;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "precios_producto", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"producto_id", "unidad_medida_id", "tipo_precio"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class PrecioProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unidad_medida_id", nullable = false)
    private UnidadMedida unidadMedida;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_precio", nullable = false, length = 20)
    private TipoPrecio tipoPrecio;

    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "minimo_cantidad", nullable = false)
    private Integer minimoCantidad = 1;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
