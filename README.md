# Sistema POS “El Hogar”

El **Sistema POS “El Hogar”** es una aplicación web desarrollada para la administración de un negocio de venta de electrodomésticos, brindando un control integral sobre ventas, inventario, compras, usuarios, proveedores y traslados entre sucursales.

Su propósito principal es automatizar las operaciones comerciales y facilitar la toma de decisiones mediante reportes y controles de stock actualizados.

---

## Objetivos del sistema
- Agilizar el proceso de facturación y venta.  
- Mantener un control de inventario en tiempo real.  
- Registrar compras, traslados y movimientos de productos.  
- Gestionar usuarios, roles y permisos de acceso.  
- Permitir la visualización de reportes generales y por sucursal.

---

## Tecnologías utilizadas
- **Frontend:** React (con Vite y Axios)  
- **Backend:** Spring Boot (Java 17)  
- **Base de datos:** PostgreSQL  
- **Autenticación y seguridad:** JWT + Auth0  
- **Contenedores:** Docker Compose  
- **Despliegue:** Azure Virtual Machine (Ubuntu Server)

---

## Índice de Documentación

| Sección | Descripción |
|----------|--------------|
| [Arquitectura](arquitectura.md) | Estructura del sistema, capas y comunicación entre módulos. |
| [Módulos del Sistema](modulos-del-sistema.md) | Descripción de los módulos principales (ventas, inventario, compras, etc.). |
| [Base de Datos](base-de-datos/README.md) | Modelo entidad-relación, diseño lógico y estructura general. |
| [Script PostgreSQL](base-de-datos/script-postgres-sql.md) | Script SQL usado para crear las tablas y relaciones. |
| [Backend](backend.md) | Descripción del API REST, endpoints, controladores y servicios. |
| [Frontend](frontend.md) | Estructura y componentes clave de la aplicación React. |
| [Seguridad](seguridad.md) | Autenticación, autorización y configuración de JWT/Auth0. |
| [Despliegue](despliegue.md) | Pasos para levantar el sistema con Docker Compose y despliegue en Azure. |
| [Acceso al Sistema](acceso-al-sistema.md) | URL de acceso y credenciales de prueba. |

