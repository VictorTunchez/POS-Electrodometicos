# Seguridad

El sistema POS implementa un **mecanismo de seguridad basado en tokens JWT (JSON Web Token)** utilizando **Auth0** como proveedor de autenticación.\
El objetivo principal de este módulo es garantizar que solo los usuarios autenticados y autorizados puedan acceder a los recursos protegidos del backend, manteniendo la integridad y confidencialidad de los datos.

#### 1. Arquitectura de seguridad

El proceso de autenticación y autorización sigue el siguiente flujo:

1. El usuario inicia sesión mediante el sistema Auth0.
2. Auth0 genera un **token JWT** que contiene la información del usuario (claims).
3. El cliente (frontend React) almacena este token en memoria o local storage.
4.  En cada solicitud HTTP hacia el backend, el cliente incluye el token en el encabezado:

    ```
    Authorization: Bearer <token>
    ```
5. El backend (Spring Boot) intercepta la solicitud mediante **Spring Security**, valida el token y autoriza o deniega el acceso según los permisos definidos.

#### 2.  Dependencias clave en el backend

Las siguientes dependencias proporcionan las funcionalidades necesarias:

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
  <groupId>com.auth0</groupId>
  <artifactId>java-jwt</artifactId>
  <version>4.5.0</version>
</dependency>
```

* **spring-boot-starter-security:** configura los filtros de seguridad, autenticación y autorización.
* **java-jwt:** permite decodificar y validar los tokens generados por Auth0.

#### 3.  Validación del Token JWT

El backend utiliza un **filtro personalizado** que intercepta las solicitudes antes de llegar a los controladores.\
Este filtro realiza las siguientes acciones:

1. Extrae el token del encabezado `Authorization`.
2. Valida su estructura y firma utilizando la clave pública proporcionada por Auth0.
3. Si es válido, establece la autenticación en el contexto de seguridad (`SecurityContextHolder`).
4. Si es inválido o no existe, bloquea el acceso al recurso.

Ejemplo de código de validación (fragmento conceptual):

```java
DecodedJWT decodedJWT = JWT.require(Algorithm.HMAC256(secretKey))
        .withIssuer("https://tu-dominio.auth0.com/")
        .build()
        .verify(token);
```

#### 4.  Configuración de filtros y acceso

Se configura una clase de seguridad global (`SecurityConfig`) que define:

* Los **endpoints públicos** (por ejemplo, `/auth/**`, `/public/**`).
* Los **endpoints protegidos** (por ejemplo, `/api/**`, `/ventas/**`, `/inventario/**`).
* El filtro de validación JWT para todas las peticiones HTTP entrantes.

Ejemplo:

```java
http.csrf().disable()
    .authorizeHttpRequests(auth -> auth
        .requestMatchers("/auth/**").permitAll()
        .anyRequest().authenticated()
    )
    .addFilterBefore(new JwtAuthorizationFilter(), UsernamePasswordAuthenticationFilter.class);
```

#### 5. Roles y permisos

Los roles del sistema, como **Administrador**, **Cajero** o **Gerente**, se incluyen en los claims del token JWT.\
Durante la validación, el backend interpreta estos roles y los utiliza para controlar el acceso a determinados endpoints.

Por ejemplo:

```java
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/usuarios")
public List<Usuario> listarUsuarios() {
    return usuarioService.findAll();
}
```

#### 6.  Integración con el frontend (React)

El frontend gestiona la autenticación a través de Auth0.\
Cuando el usuario inicia sesión correctamente, el token JWT se almacena temporalmente y se adjunta a cada solicitud HTTP mediante Axios:

```js
axios.get('/api/ventas', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

De esta manera, solo los usuarios autenticados pueden acceder a las rutas protegidas de la aplicación.
