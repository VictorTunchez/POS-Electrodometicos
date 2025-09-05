package pos.api.domain.sucursal;

import jakarta.persistence.*;
import lombok.*;
import pos.api.domain.user.Usuario;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "sucursales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Sucursal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_sucursal", nullable = false, length = 100)
    private String nombreSucursal;

    @Column(length = 255)
    private String direccion;

    @Column(length = 50)
    private String telefono;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @OneToMany(mappedBy = "sucursal", fetch = FetchType.LAZY)
    private Set<Usuario> usuarios = new HashSet<>();

    //para saber si está activo
    public boolean isActivo() {
        return deletedAt == null;
    }

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
