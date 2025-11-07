package pos.api.domain.inventario.traslados;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pos.api.domain.sucursal.Sucursal;
import pos.api.domain.usuario.Usuario;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "traslados")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Traslado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_origen_id", nullable = false)
    private Sucursal sucursalOrigen;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_destino_id", nullable = false)
    private Sucursal sucursalDestino;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_traslado", nullable = false)
    private Instant fechaTraslado;

    @Column(name = "estado", nullable = false)
    @Enumerated(EnumType.STRING)
    private EstadoTraslado estado;

    @Column(name = "observaciones")
    private String observaciones;

    @OneToMany(mappedBy = "traslado", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleTraslado> detalles = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        fechaTraslado = Instant.now();
        if (estado == null) {
            estado = EstadoTraslado.PENDIENTE;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
