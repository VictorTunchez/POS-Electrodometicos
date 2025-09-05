package pos.api.domain.user.rol;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "permisos")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String codigo; // Ej: "USUARIOS_CREAR", "VENTAS_VER"

    @Column(length = 255)
    private String descripcion;

    @Column(length = 100)
    private String categoria; // Ej: "Usuarios", "Ventas", "Inventario"
}

