package pos.api.domain.tarjetaRegalo;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "tarjetas_regalo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class TarjetaRegalo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montoInicial;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal saldoActual;

    @Column(nullable = false, length = 10)
    private String moneda;

    @Column(nullable = false)
    private Instant fechaEmision;

    @Column(nullable = false)
    private Instant fechaExpiracion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoTarjeta estado;

    private String creadoPor;
    private Instant createdAt;

    private String modificadoPor;
    private Instant updatedAt;

    private String eliminadoPor;
    private Instant deletedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public boolean estaActiva() {
        return estado == EstadoTarjeta.ACTIVA && deletedAt == null;
    }
}
