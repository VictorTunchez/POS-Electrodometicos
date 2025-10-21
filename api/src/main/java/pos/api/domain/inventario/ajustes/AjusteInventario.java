package pos.api.domain.inventario.ajustes;


import jakarta.persistence.*;
import lombok.*;
import pos.api.domain.producto.Producto;
import pos.api.domain.sucursal.Sucursal;
import pos.api.domain.usuario.Usuario;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "ajustes_inventario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class AjusteInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @Column(name = "stock_anterior", nullable = false, precision = 15, scale = 4)
    private BigDecimal stockAnterior;

    @Column(name = "stock_nuevo", nullable = false, precision = 15, scale = 4)
    private BigDecimal stockNuevo;

    @Column(name = "diferencia", nullable = false, precision = 15, scale = 4)
    private BigDecimal diferencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_ajuste", nullable = false)
    private TipoAjuste tipoAjuste; // INCREMENTO, DECREMENTO, CORRECCION

    @Column(name = "motivo", nullable = false)
    private String motivo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "observaciones")
    private String observaciones;

    @Column(name = "fecha_ajuste", nullable = false)
    private Instant fechaAjuste;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        fechaAjuste = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}

