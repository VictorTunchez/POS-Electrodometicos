package pos.api.domain.user.rol;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pos.api.domain.user.IUsuarioRepository;
import pos.api.domain.user.Usuario;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolService {

    private final IRolRepository rolRepository;
    private final IPermisoRepository permisoRepository;
    private final IUsuarioRepository usuarioRepository;

    public RolResponseDto crearRol(RolRequestDto dto) {
        if (rolRepository.findByNombreRol(dto.nombreRol()).isPresent()) {
            throw new IllegalStateException("El rol ya existe: " + dto.nombreRol());
        }

        Rol rol = new Rol();
        rol.setNombreRol(dto.nombreRol());
        rol.setDescripcion(dto.descripcion());

        if (dto.permisoIds() != null) {
            Set<Permiso> permisos = new HashSet<>(permisoRepository.findAllById(dto.permisoIds()));
            rol.setPermisos(permisos);
        }

        Rol guardado = rolRepository.save(rol);
        return convertirAResponseDto(guardado);
    }

    public List<RolResponseDto> listarRoles() {
        return rolRepository.findByDeletedAtIsNull().stream()
                .map(this::convertirAResponseDto)
                .toList();
    }

    public List<RolResponseDto> listarTodosRoles() {
        return rolRepository.findAll().stream()
                .map(this::convertirAResponseDto)
                .toList();
    }

    public RolResponseDto obtenerRolPorId(Long id) {
        Rol rol = rolRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con ID: " + id));
        return convertirAResponseDto(rol);
    }

    public List<PermisoResponseDto> listarTodosLosPermisos() {
        return permisoRepository.findAll().stream()
                .map(this::convertirPermisoADto)
                .toList();
    }

    public RolResponseDto actualizarRol(Long id, RolRequestDto dto) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con ID: " + id));

        if (!rol.getNombreRol().equals(dto.nombreRol()) &&
                rolRepository.findByNombreRol(dto.nombreRol()).isPresent()) {
            throw new IllegalStateException("El nombre de rol ya existe: " + dto.nombreRol());
        }

        rol.setNombreRol(dto.nombreRol());
        rol.setDescripcion(dto.descripcion());

        if (dto.permisoIds() != null) {
            Set<Permiso> permisos = new HashSet<>(permisoRepository.findAllById(dto.permisoIds()));
            rol.setPermisos(permisos);
        }

        Rol actualizado = rolRepository.save(rol);
        return convertirAResponseDto(actualizado);
    }

    public void eliminarRol(Long id) {
        Rol rol = rolRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con ID: " + id));

        List<Usuario> usuariosConEsteRol = usuarioRepository.findByRolId(id);

        if (!usuariosConEsteRol.isEmpty()) {
            throw new IllegalStateException("No se puede eliminar el rol. Está asignado a " +
                    usuariosConEsteRol.size() + " usuario(s)");
        }

        rol.setDeletedAt(Instant.now());
        rolRepository.save(rol);
    }

    public RolResponseDto restaurarRol(Long id) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Rol no encontrado con ID: " + id));

        rol.setDeletedAt(null);
        Rol restaurado = rolRepository.save(rol);
        return convertirAResponseDto(restaurado);
    }

    private RolResponseDto convertirAResponseDto(Rol rol) {
        return new RolResponseDto(
                rol.getId(),
                rol.getNombreRol(),
                rol.getDescripcion(),
                rol.getPermisos().stream()
                        .map(this::convertirPermisoADto)
                        .collect(Collectors.toSet()),
                rol.getCreatedAt(),
                rol.getUpdatedAt(),
                rol.getDeletedAt()
        );
    }

    private PermisoResponseDto convertirPermisoADto(Permiso permiso) {
        return new PermisoResponseDto(
                permiso.getId(),
                permiso.getCodigo(),
                permiso.getDescripcion(),
                permiso.getCategoria()
        );
    }
}


