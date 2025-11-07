# Frontend

El frontend está desarrollado en **React** con **Vite** como herramienta de compilación.\
Se enfoca en la **modularidad y reutilización de componentes**, aplicando una estructura clara basada en servicios, hooks y componentes.

### 1. Estructura del proyecto

src/\
│\
├── components/\
│ ├── productos/\
│ ├── ventas/\
│ ├── usuarios/\
│ └── shared/\
│\
├── services/\
│ ├── productoService.js\
│ ├── ventaService.js\
│ └── usuarioService.js\
│\
├── hooks/\
│ ├── useProductos.js\
│ └── useVentas.js\
│\
├── pages/\
│ ├── ProductosPage.jsx\
│ ├── VentasPage.jsx\
│ └── LoginPage.jsx\
│\
└── App.jsx

### 2. Comunicación con el backend

Cada módulo del frontend tiene un archivo **service** encargado de comunicarse con el backend mediante **Axios**, consumiendo los endpoints definidos en los controladores de Spring Boot.

Ejemplo:

```javascript
// services/productoService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/productos';

export const getProductos = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const crearProducto = async (producto) => {
  const response = await axios.post(API_URL, producto);
  return response.data;
};
```

Estos servicios son utilizados dentro de los componentes y hooks, promoviendo la separación de responsabilidades.

### 3. Uso de Hooks personalizados

Cada módulo implementa hooks que encapsulan la lógica de estado, peticiones y manejo de errores.

Ejemplo:

```javascript
// hooks/useProductos.js
import { useState, useEffect } from 'react';
import { getProductos } from '../services/productoService';

export const useProductos = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    getProductos().then(data => setProductos(data));
  }, []);

  return { productos };
};
```

### 4. Componentización y estructura visual

Los componentes se dividen en:

* **Principal (Page):** gestiona el flujo general.
* **Componentes secundarios:** formularios, tablas, botones, etc.
* **Compartidos:** se reutilizan entre módulos (por ejemplo, modal o spinner).

La UI utiliza **Bootstrap** como base de diseño, aprovechando su sistema de rejilla, estilos y componentes visuales.\
Además, se integran **íconos de Bootstrap Icons** para mejorar la experiencia del usuario.

### 5. Manejo de autenticación y seguridad

El frontend almacena el token JWT generado por Auth0 en el `localStorage`.\
Cada petición a los endpoints protegidos incluye el encabezado:

```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

Esto asegura que solo los usuarios autenticados puedan acceder a funcionalidades específicas según su rol.

### 6. Ejecución del proyecto

Para ejecutar el frontend localmente:

```bash
npm install
npm run dev
```

Por defecto, el sistema se ejecuta en:

```
http://localhost:5173
```

Durante el despliegue, el contenedor de React se comunica con el backend por red interna en Docker(puerto 80 durante el despliegue).
