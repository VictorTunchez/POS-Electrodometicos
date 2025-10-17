package pos.api.domain.usuario;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pos.api.domain.sucursal.ISucursalRepository;
import pos.api.domain.sucursal.Sucursal;
import pos.api.domain.usuario.rol.IRolRepository;
import pos.api.domain.usuario.rol.Rol;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {

    private final IUsuarioRepository usuarioRepository;
    private final IRolRepository rolRepository;
    private final ISucursalRepository sucursalRepository;
    private final PasswordEncoder passwordEncoder;

    // Crear usuario
    @Transactional
    public UsuarioResponseDto crearUsuario(UsuarioRequestDto dto, Usuario creador) {
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new IllegalStateException("Ya existe un usuario con el email: " + dto.email());
        }

        Rol rol = rolRepository.findById(dto.rolId())
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con ID: " + dto.rolId()));

        Sucursal sucursal = null;
        if (dto.sucursalId() != null) {
            sucursal = sucursalRepository.findById(dto.sucursalId())
                    .orElseThrow(() -> new IllegalArgumentException("Sucursal no encontrada con ID: " + dto.sucursalId()));
        }

        Usuario usuario = new Usuario();
        usuario.setEmail(dto.email());
        usuario.setNombre(dto.nombre());
        usuario.setApellido(dto.apellido());
        usuario.setContrasena(passwordEncoder.encode(dto.contrasena()));
        usuario.setRol(rol);
        usuario.setSucursal(sucursal);
        usuario.setCreadoPor(creador);

        Usuario guardado = usuarioRepository.save(usuario);
        return mapToResponse(guardado);
    }

    // Listar usuarios activos
    public List<UsuarioResponseDto> listarUsuarios() {
        return usuarioRepository.findByDeletedAtIsNull().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Obtener usuario por ID
    public UsuarioResponseDto obtenerUsuario(Long id) {
        Usuario usuario = usuarioRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));
        return mapToResponse(usuario);
    }

    // Actualizar usuario
    @Transactional
    public UsuarioResponseDto actualizarUsuario(Long id, ActualizarUsuarioRequestDto dto, Usuario editor) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        if (!usuario.getEmail().equals(dto.email()) && usuarioRepository.existsByEmail(dto.email())) {
            throw new IllegalStateException("Ya existe un usuario con el email: " + dto.email());
        }

        Rol rol = rolRepository.findById(dto.rolId())
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con ID: " + dto.rolId()));

        Sucursal sucursal = null;
        if (dto.sucursalId() != null) {
            sucursal = sucursalRepository.findById(dto.sucursalId())
                    .orElseThrow(() -> new IllegalArgumentException("Sucursal no encontrada con ID: " + dto.sucursalId()));
        }

        usuario.setEmail(dto.email());
        usuario.setNombre(dto.nombre());
        usuario.setApellido(dto.apellido());

        if (dto.contrasena() != null && !dto.contrasena().isBlank()) {
            usuario.setContrasena(passwordEncoder.encode(dto.contrasena()));
        }

        usuario.setRol(rol);
        usuario.setSucursal(sucursal);
        usuario.setActualizadoPor(editor);

        Usuario actualizado = usuarioRepository.save(usuario);
        return mapToResponse(actualizado);
    }

    // Eliminar usuario (soft delete)
    @Transactional
    public void eliminarUsuario(Long id, Usuario ejecutor) {
        // Validar auto-eliminación
        if (ejecutor.getId().equals(id)) {
            throw new SecurityException("No puedes eliminarte a ti mismo");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        // Soft delete
        usuario.setDeletedAt(Instant.now());
        usuarioRepository.save(usuario);

        // Invalidar tokens del usuario eliminado
        usuario.setLastPasswordChange(Instant.now());
        usuarioRepository.save(usuario);
    }

    // Restaurar usuario eliminado
    @Transactional
    public void restaurarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        usuario.setDeletedAt(null);
        usuarioRepository.save(usuario);
    }

    // Listar todos los usuarios (activos e inactivos)
    public List<UsuarioResponseDto> listarTodosUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Listar usuarios por rol
    public List<UsuarioResponseDto> listarUsuariosPorRol(Long rolId) {
        return usuarioRepository.findByRolId(rolId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Listar usuarios por sucursal
    public List<UsuarioResponseDto> listarUsuariosPorSucursal(Long sucursalId) {
        return usuarioRepository.findBySucursalId(sucursalId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Cambiar contraseña
    @Transactional
    public void cambiarContrasena(Long id, String nuevaContrasena, Usuario editor) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        usuario.setActualizadoPor(editor);
        usuarioRepository.save(usuario);
    }

    // Mapeo a DTO
    private UsuarioResponseDto mapToResponse(Usuario usuario) {
        return new UsuarioResponseDto(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getRol() != null ? usuario.getRol().getNombreRol() : null,
                usuario.getRol() != null ? usuario.getRol().getId() : null,
                usuario.getSucursal() != null ? usuario.getSucursal().getNombreSucursal() : null,
                usuario.getSucursal() != null ? usuario.getSucursal().getId() : null,
                usuario.getCreatedAt(),
                usuario.getUpdatedAt(),
                usuario.getDeletedAt(),
                usuario.getCreadoPor() != null ? usuario.getCreadoPor().getNombreCompleto() : null,
                usuario.getActualizadoPor() != null ? usuario.getActualizadoPor().getNombreCompleto() : null
        );
    }
}
