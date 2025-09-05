package pos.api.domain.user;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import pos.api.domain.sucursal.Sucursal;

import java.time.Instant;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import pos.api.domain.user.rol.Rol;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String apellido;

    @Column(unique = true, nullable = false)
    private String email;

    private String contrasena;

    private String resetContrasenaToken;

    @Column(name = "last_password_change")
    private Instant lastPasswordChange;

    @Column(name = "historial_contrasenas", columnDefinition = "TEXT")
    private String historialContrasenas;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    // Relación con Sucursal
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_sucursal")
    private Sucursal sucursal;

    // Relación con Rol
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol")
    private Rol rol;

    // Auditoría
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por")
    private Usuario creadoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actualizado_por")
    private Usuario actualizadoPor;

    // Conveniencia
    public String getNombreCompleto() {
        return nombre + " " + apellido;
    }

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

    // UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();
        if (rol != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.getNombreRol()));
            if (rol.getPermisos() != null) {
                rol.getPermisos().forEach(permiso ->
                        authorities.add(new SimpleGrantedAuthority(permiso.getCodigo()))
                );
            }
        }
        return authorities;
    }

    @Override
    public String getPassword() {
        return contrasena;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActivo();
    }

    // Métodos de conveniencia
    public boolean tieneRol(String nombreRol) {
        return rol != null && rol.getNombreRol().equalsIgnoreCase(nombreRol);
    }

    public boolean tienePermiso(String codigoPermiso) {
        return rol != null && rol.getPermisos() != null &&
                rol.getPermisos().stream().anyMatch(p -> p.getCodigo().equals(codigoPermiso));
    }
}
