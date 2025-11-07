package pos.api.domain.usuario;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pos.api.domain.usuario.rol.IPermisoRepository;
import pos.api.domain.usuario.rol.IRolRepository;
import pos.api.domain.usuario.rol.Permiso;
import pos.api.domain.usuario.rol.Rol;

import java.time.Instant;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class DataInitializer implements CommandLineRunner {

    private final IUsuarioRepository usuarioRepository;
    private final IRolRepository rolRepository;
    private final IPermisoRepository permisoRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "tunchezsuy@gmail.com";
    private static final String ADMIN_PASSWORD = "Admin123!";
    private static final String ADMIN_NOMBRE = "Victor";
    private static final String ADMIN_APELLIDO = "Tunchez";

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Iniciando inicialización de datos...");

        // 1. Crear permisos específicos del sistema
        Set<Permiso> permisos = crearPermisosEspecificos();

        // 2. Crear rol admin con todos los permisos
        Rol rolAdmin = crearRolAdminSiNoExiste(permisos);

        // 3. Crear usuario administrador
        crearUsuarioAdminSiNoExiste(rolAdmin);

        log.info("Inicialización de datos completada exitosamente");
    }

    private Set<Permiso> crearPermisosEspecificos() {
        log.info("Creando permisos específicos del sistema...");

        // Array de permisos directamente sin clase auxiliar
        String[][] permisosData = {
                // Categorías
                {"CATEGORIAS_CREAR", "Crear categorías", "Categorías"},
                {"CATEGORIAS_VER", "Ver categorías", "Categorías"},
                {"CATEGORIAS_EDITAR", "Editar categorías", "Categorías"},
                {"CATEGORIAS_ELIMINAR", "Eliminar categorías", "Categorías"},
                {"CATEGORIAS_ADMIN", "Administrar categorías", "Categorías"},

                // Clientes
                {"CLIENTES_CREAR", "Crear clientes", "Clientes"},
                {"CLIENTES_VER", "Ver clientes", "Clientes"},
                {"CLIENTES_EDITAR", "Editar clientes", "Clientes"},
                {"CLIENTES_ELIMINAR", "Eliminar clientes", "Clientes"},

                // Compras
                {"COMPRAS_CREAR", "Crear compras", "Compras"},
                {"COMPRAS_VER", "Ver compras", "Compras"},
                {"COMPRAS_EDITAR", "Editar compras", "Compras"},
                {"COMPRAS_ELIMINAR", "Eliminar compras", "Compras"},

                // Inventario
                {"INVENTARIO_CREAR", "Crear inventario", "Inventario"},
                {"INVENTARIO_VER", "Ver inventario", "Inventario"},
                {"INVENTARIO_EDITAR", "Editar inventario", "Inventario"},
                {"INVENTARIO_ELIMINAR", "Eliminar inventario", "Inventario"},

                //Nuevos roles de inventario
                {"INVENTARIO_AJUSTAR", "Ajustar inventarios", "Inventario"},
                {"INVENTARIO_VER_MOVIMIENTOS", "Ver movimientos", "Inventario"},

                // Precios
                {"PRECIOS_CREAR", "Crear precios", "Precios"},
                {"PRECIOS_VER", "Ver precios", "Precios"},
                {"PRECIOS_EDITAR", "Editar precios", "Precios"},
                {"PRECIOS_ELIMINAR", "Eliminar precios", "Precios"},

                // Productos
                {"PRODUCTOS_CREAR", "Crear productos", "Productos"},
                {"PRODUCTOS_VER", "Ver productos", "Productos"},
                {"PRODUCTOS_EDITAR", "Editar productos", "Productos"},
                {"PRODUCTOS_ELIMINAR", "Eliminar productos", "Productos"},
                {"PRODUCTOS_ADMIN", "Administrar productos", "Productos"},

                // Proveedores
                {"PROVEEDORES_CREAR", "Crear proveedores", "Proveedores"},
                {"PROVEEDORES_VER", "Ver proveedores", "Proveedores"},
                {"PROVEEDORES_EDITAR", "Editar proveedores", "Proveedores"},
                {"PROVEEDORES_ELIMINAR", "Eliminar proveedores", "Proveedores"},
                {"PROVEEDORES_ADMIN", "Administrar proveedores", "Proveedores"},

                // Roles
                {"ROLES_CREAR", "Crear roles", "Roles"},
                {"ROLES_VER", "Ver roles", "Roles"},
                {"ROLES_EDITAR", "Editar roles", "Roles"},
                {"ROLES_ELIMINAR", "Eliminar roles", "Roles"},
                {"ROLES_ADMIN", "Administrar roles", "Roles"},
                {"PERMISOS_VER", "Ver permisos de roles", "Roles"},

                // Sucursales
                {"SUCURSALES_CREAR", "Crear sucursales", "Sucursales"},
                {"SUCURSALES_VER", "Ver sucursales", "Sucursales"},
                {"SUCURSALES_EDITAR", "Editar sucursales", "Sucursales"},
                {"SUCURSALES_ELIMINAR", "Eliminar sucursales", "Sucursales"},
                {"SUCURSALES_ADMIN", "Administrar sucursales", "Sucursales"},

                // Unidades de Medida
                {"UNIDADES_MEDIDA_CREAR", "Crear unidades de medida", "UnidadesMedida"},
                {"UNIDADES_MEDIDA_VER", "Ver unidades de medida", "UnidadesMedida"},
                {"UNIDADES_MEDIDA_EDITAR", "Editar unidades de medida", "UnidadesMedida"},
                {"UNIDADES_MEDIDA_ELIMINAR", "Eliminar unidades de medida", "UnidadesMedida"},
                {"UNIDADES_MEDIDA_ADMIN", "Administrar unidades de medida", "UnidadesMedida"},

                // Usuarios
                {"USUARIOS_CREAR", "Crear usuarios", "Usuarios"},
                {"USUARIOS_VER", "Ver usuarios", "Usuarios"},
                {"USUARIOS_EDITAR", "Editar usuarios", "Usuarios"},
                {"USUARIOS_ELIMINAR", "Eliminar usuarios", "Usuarios"},
                {"USUARIOS_ADMIN", "Administrar usuarios", "Usuarios"},

                // Ventas
                {"VENTAS_CREAR", "Crear ventas", "Ventas"},
                {"VENTAS_VER", "Ver ventas", "Ventas"},
                {"VENTAS_EDITAR", "Editar ventas", "Ventas"},
                {"VENTAS_ELIMINAR", "Eliminar ventas", "Ventas"},
        };

        Set<Permiso> permisosCreados = new HashSet<>();

        for (String[] permisoData : permisosData) {
            String codigo = permisoData[0];
            String descripcion = permisoData[1];
            String categoria = permisoData[2];

            // CORRECCIÓN: Manejar el Optional correctamente
            Optional<Permiso> permisoExistenteOpt = permisoRepository.findByCodigo(codigo);
            if (permisoExistenteOpt.isEmpty()) {
                Permiso nuevoPermiso = Permiso.builder()
                        .codigo(codigo)
                        .descripcion(descripcion)
                        .categoria(categoria)
                        .build();
                Permiso permisoGuardado = permisoRepository.save(nuevoPermiso);
                permisosCreados.add(permisoGuardado);
                log.info("Permiso creado: {}", codigo);
            } else {
                Permiso permisoExistente = permisoExistenteOpt.get();
                permisosCreados.add(permisoExistente);
                // Actualizar descripción y categoría si es necesario
                if (!permisoExistente.getDescripcion().equals(descripcion) ||
                        !permisoExistente.getCategoria().equals(categoria)) {
                    permisoExistente.setDescripcion(descripcion);
                    permisoExistente.setCategoria(categoria);
                    permisoRepository.save(permisoExistente);
                    log.info("Permiso actualizado: {}", codigo);
                }
            }
        }

        log.info("Total de permisos creados/actualizados: {}", permisosCreados.size());
        return permisosCreados;
    }

    private Rol crearRolAdminSiNoExiste(Set<Permiso> permisos) {
        log.info("Verificando rol admin...");

        Rol rolAdmin = rolRepository.findByNombreRol("admin")
                .orElse(null);

        if (rolAdmin == null) {
            rolAdmin = new Rol();
            rolAdmin.setNombreRol("admin");
            rolAdmin.setDescripcion("Rol de administrador con todos los permisos del sistema");
            rolAdmin.setPermisos(permisos);
            rolAdmin.setCreatedAt(Instant.now());

            rolAdmin = rolRepository.save(rolAdmin);
            log.info("Rol 'admin' creado exitosamente con {} permisos", permisos.size());
        } else {
            // Actualizar permisos del rol admin existente
            boolean permisosCambiaron = !rolAdmin.getPermisos().equals(permisos);
            if (permisosCambiaron) {
                rolAdmin.setPermisos(permisos);
                rolAdmin = rolRepository.save(rolAdmin);
                log.info("Rol 'admin' actualizado con {} permisos", permisos.size());
            } else {
                log.info("Rol 'admin' ya existe con {} permisos", permisos.size());
            }
        }

        return rolAdmin;
    }

    private void crearUsuarioAdminSiNoExiste(Rol rolAdmin) {
        log.info("Verificando usuario administrador...");

        Usuario usuarioAdmin = usuarioRepository.findByEmail(ADMIN_EMAIL);

        if (usuarioAdmin == null) {
            usuarioAdmin = new Usuario();
            usuarioAdmin.setNombre(ADMIN_NOMBRE);
            usuarioAdmin.setApellido(ADMIN_APELLIDO);
            usuarioAdmin.setEmail(ADMIN_EMAIL);
            usuarioAdmin.setContrasena(passwordEncoder.encode(ADMIN_PASSWORD));
            usuarioAdmin.setRol(rolAdmin);
            // Sin sucursal - permitido por el sistema
            usuarioAdmin.setSucursal(null);
            usuarioAdmin.setLastPasswordChange(Instant.now());
            usuarioAdmin.setCreatedAt(Instant.now());

            // Para evitar referencia circular, primero guardamos sin creadoPor
            usuarioAdmin.setCreadoPor(null);
            Usuario usuarioGuardado = usuarioRepository.save(usuarioAdmin);

            // Luego actualizamos con la auto-referencia
            usuarioGuardado.setCreadoPor(usuarioGuardado);
            usuarioRepository.save(usuarioGuardado);

            log.info("=== USUARIO ADMINISTRADOR CREADO ===");
            log.info("Email: {}", ADMIN_EMAIL);
            log.info("Contraseña: {}", ADMIN_PASSWORD);
            log.info("Rol: admin");
            log.info("Permisos: Todos los permisos del sistema");
            log.info("=====================================");
        } else {
            log.info("Usuario administrador ya existe: {}", ADMIN_EMAIL);

            // Actualizar rol del admin existente si es necesario
            if (usuarioAdmin.getRol() == null || !usuarioAdmin.getRol().getId().equals(rolAdmin.getId())) {
                usuarioAdmin.setRol(rolAdmin);
                usuarioRepository.save(usuarioAdmin);
                log.info("Rol actualizado para el usuario administrador");
            }
        }
    }
}