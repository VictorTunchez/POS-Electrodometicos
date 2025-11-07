# Despliegue

El despliegue del sistema POS se realiza mediante **Docker Compose**, lo que permite levantar de forma integrada los servicios de **PostgreSQL**, **backend (Spring Boot)** y **frontend (React)** en un entorno aislado y replicable.\
Esta configuración facilita la portabilidad y la flexibilidad para entornos locales o en la nube.

#### 1. Estructura de Docker Compose

El archivo `docker-compose.yml` define tres servicios principales:

```yaml
services:
  postgres:
    image: postgres:15
    container_name: postgres
    environment:
      POSTGRES_DB: pos_apiv2
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 1234
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - pos-network

  backend:
    build: ./api
    container_name: backend
    depends_on:
      - postgres
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/pos_apiv2
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: 1234
      STRIPE_SECRET_KEY: sk_test_51SFM2pC57XwKRgTNz1RaSJntbOvaMEDZQwVURxvdapi5e3TQerv6dzbZq2fV83bruVjoE6nQq9abIMu8193peSnw00KWAGd5FZ
      FRONTEND_URL_INTERNAL: http://frontend
      FRONTEND_URL_PUBLIC: http://localhost:80
    ports:
      - "8080:8080"
    networks:
      - pos-network

  frontend:
    build: ./react
    container_name: frontend
    depends_on:
      - backend
    ports:
      - "80:80"
    networks:
      - pos-network

networks:
  pos-network:

volumes:
  postgres_data:
```

**Comandos principales:**

```bash
docker compose build
docker compose up -d
```

Esto levanta los tres servicios de forma automática, manteniendo las dependencias entre contenedores.

#### 2. Despliegue en Azure

Para publicar el sistema en un entorno accesible por Internet:

* Se utilizó una **máquina virtual en Azure** donde se instaló Docker.
* Se abrió el **puerto 80** en el firewall de la máquina para permitir el acceso público al frontend.
* El servicio **Nginx** se configuró como servidor inverso, gestionando las rutas entre el frontend (React) y el backend (Spring Boot).
* No se utilizó archivo `.env`; las rutas y variables fueron gestionadas directamente en la configuración de Nginx y el archivo Compose.

#### 3. Resultado final

Una vez desplegado, el sistema queda accesible mediante el navegador desde la IP pública de Azure, ejecutando el frontend en el puerto 80 y comunicándose internamente con el backend y la base de datos a través de la red `pos-network` de Docker.

Prueba de la mv de azure:&#x20;

<figure><img src=".gitbook/assets/image (13).png" alt=""><figcaption></figcaption></figure>
