# Backend

El backend del sistema POS “El Hogar” está desarrollado en **Spring Boot**, aplicando una arquitectura **en capas y orientada a servicios**, que separa claramente la lógica de negocio de la persistencia y de la comunicación con la base de datos.

### 1. Estructura general del backend

El proyecto está organizado bajo el siguiente patrón:

src/main/java/com/elhogar/pos/\
│\
├── controller/\
├── service/\
├── repository/\
├── model/\
└── dto/

#### • `model` (Entidades)

Contiene las clases de modelo anotadas con `@Entity`.\
Cada clase representa una tabla de la base de datos y define sus atributos, relaciones y restricciones.

Se utiliza **Lombok** (`@Data`, `@Builder`, etc.) para reducir código repetitivo (getters, setters y constructores).

#### • `dto` (Objetos de transferencia de datos)

Contiene las clases **DTO (Data Transfer Object)** que permiten recibir y enviar información sin exponer directamente las entidades.\
Esto mejora la seguridad y desacopla la capa de presentación de la capa de datos.

#### • `repository` (Capa de persistencia)

Define las interfaces que extienden de **JpaRepository**, lo que permite interactuar con la base de datos de manera declarativa.

Ejemplo:

```java
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    Optional<Producto> findByNombre(String nombre);
}
```

#### • `service` (Lógica de negocio)

Contiene la lógica principal del sistema.\
Cada entidad cuenta con su respectivo servicio, donde se manejan validaciones, cálculos, verificaciones de existencia y transacciones.

#### • `controller` (Capa de presentación)

Define los **endpoints REST** expuestos al frontend.\
Cada controlador se comunica con un servicio, recibe y retorna objetos DTO y maneja las respuestas HTTP.

Ejemplo:&#x20;

```
@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoService productoService;

    @PreAuthorize("@autorizacionService.tienePermiso('PRODUCTOS_CREAR')")
    @PostMapping
    public ResponseEntity<ProductoResponseDto> crearProducto(@RequestBody @Valid ProductoRequestDto dto) {
        ProductoResponseDto response = productoService.crearProducto(dto);
        return ResponseEntity.ok(response);
    }
```

### 2. Comunicación con la Base de Datos

El acceso a la base de datos PostgreSQL se realiza mediante **Spring Data JPA**.\
El sistema permite operaciones CRUD y consultas personalizadas definidas por método o con la anotación `@Query`.

### 3. Dependencias principales

El proyecto utiliza las siguientes dependencias clave en el archivo `pom.xml`:

* **Spring Boot Starter Web** → para crear y exponer servicios REST.
* **Spring Boot Starter Data JPA** → para persistencia con Hibernate.
* **Spring Boot Starter Validation** → para validar DTOs con anotaciones (`@NotNull`, `@Email`, etc.).
* **PostgreSQL Driver** → conexión a la base de datos.
* **Lombok** → simplificación del código boilerplate.
* **Spring Boot Starter Security** → configuración de seguridad.
* **Auth0 Java JWT** → generación y validación de tokens JWT.
* **Spring Boot Starter Mail** → envío de notificaciones por correo.
* **Stripe Java SDK** → integración de pagos con tarjeta.
* **OpenPDF** → generación de reportes PDF.

