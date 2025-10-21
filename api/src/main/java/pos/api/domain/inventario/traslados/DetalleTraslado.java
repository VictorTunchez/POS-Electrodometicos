package pos.api.domain.inventario.traslados;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pos.api.domain.producto.Producto;
import pos.api.domain.unidadMedida.UnidadMedida;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "detalle_traslado")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DetalleTraslado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "traslado_id", nullable = false)
    private Traslado traslado;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unidad_medida_id", nullable = false)
    private UnidadMedida unidadMedida;

    @Column(name = "cantidad", nullable = false, precision = 10, scale = 4)
    private BigDecimal cantidad;

    @Column(name = "cantidad_en_unidad_base", nullable = false, precision = 15, scale = 4)
    private BigDecimal cantidadEnUnidadBase;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
