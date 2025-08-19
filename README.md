Sistema pos 

Tecnologias
Backend
-Java 21
-Spring boot
-Postgres sql

Fronted
-Vite
-React
-Bootstrap

Funcionalidades actuales
Login

Proceso de Login
El usuario escribe su correo y contraseña en el frontend.
El backend recibe esos datos y busca al usuario en la base de datos.
Se valida la contraseña (se compara con la que está guardada de forma segura).
Si todo está bien, se genera un token de acceso que identifica al usuario.
Ese token se envía al frontend y se usará en las siguientes peticiones para reconocer al usuario.

Proceso de Recuperación de Contraseña
El usuario indica que olvidó su contraseña y pone su correo.
El backend revisa si el correo existe en la base de datos.
Si existe, se envía un correo con un enlace único y temporal para recuperar la contraseña.
El usuario abre el enlace, que lo lleva a una pantalla para escribir la nueva contraseña.
El backend recibe la nueva contraseña y la guarda de forma segura en la base de datos.