# TODO LIST REST API - versión final estudiante

Proyecto realizado con **Node.js, Express y SQLite**. Incluye:

- API REST para tareas.
- Pantalla web con HTML, CSS y JavaScript.
- Base de datos SQLite.
- Módulo tipo **Drive local** para subir, editar, eliminar y descargar archivos.

---

## 1. Requisitos para ejecutar el proyecto

La computadora debe tener instalado:

- **Node.js**.
- **npm**, que normalmente viene incluido con Node.js.
- Un navegador web.
- Opcional: **Postman** para probar la API.
- Opcional: **Git** si el docente va a clonar el repositorio desde GitHub.

---

## 2. Instalación

Abrir una terminal dentro de la carpeta del proyecto y ejecutar:

```bash
npm install
```

Luego copiar el archivo de variables de entorno:

```bash
copy .env.example .env
```

En Git Bash o Linux/Mac también se puede usar:

```bash
cp .env.example .env
```

---

## 3. Ejecutar el servidor

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Si todo funciona correctamente, debe aparecer algo parecido a:

```txt
Servidor corriendo en http://localhost:3000
Pantalla: http://localhost:3000/app
API: http://localhost:3000/todos
```

---

## 4. Acceder a la pantalla web

Abrir en el navegador:

```txt
http://localhost:3000/app
```

Desde esa pantalla se puede:

- Crear tareas.
- Marcar tareas como completadas.
- Editar tareas.
- Eliminar tareas.
- Subir archivos al Drive local.
- Editar archivos cambiando su nombre o reemplazando su contenido.
- Descargar archivos.
- Eliminar archivos.

---

## 5. Funcionamiento del Drive local

El Drive local funciona con dos partes:

1. **Base de datos SQLite**: guarda la información del archivo, como nombre, tipo, tamaño, fecha de creación y fecha de actualización.
2. **Carpeta `drive/`**: guarda físicamente los archivos subidos.

Cuando se sube un archivo:

- El archivo se guarda dentro de la carpeta `drive/`.
- SQLite guarda el registro del archivo en la tabla `files`.

Cuando se edita un archivo:

- Se puede cambiar solo el nombre visible del archivo.
- También se puede reemplazar el contenido por otro archivo.

Cuando se elimina un archivo:

- Se borra el archivo físico de la carpeta `drive/`.
- Se borra su registro de la base de datos.

Cuando se descarga un archivo:

- El servidor busca el archivo por su ID.
- Luego responde con una descarga usando `res.download()`.

---

## 6. Rutas REST de tareas

```txt
GET    /todos
GET    /todos/:id
POST   /todos
PUT    /todos/:id
DELETE /todos/:id
```

### Crear tarea

```http
POST /todos
Content-Type: application/json
```

```json
{
  "titulo": "Estudiar Express",
  "descripcion": "Repasar rutas y controladores",
  "prioridad": "alta",
  "categoria": "Universidad"
}
```

### Editar tarea

```http
PUT /todos/1
Content-Type: application/json
```

```json
{
  "titulo": "Estudiar Express y SQLite",
  "completado": true
}
```

---

## 7. Rutas REST de archivos Drive

```txt
GET    /files
GET    /files/:id
POST   /files?filename=nombre.pdf
PUT    /files/:id?filename=nuevo-nombre.pdf
GET    /files/:id/download
DELETE /files/:id
```

### Listar archivos

```http
GET /files
```

### Subir archivo

```http
POST /files?filename=documento.pdf
Content-Type: application/octet-stream
```

En Postman se puede probar usando:

1. Método `POST`.
2. URL: `http://localhost:3000/files?filename=documento.pdf`.
3. Pestaña **Body**.
4. Seleccionar **binary**.
5. Elegir un archivo de la computadora.
6. Enviar la petición.

### Editar archivo

Para cambiar el nombre:

```http
PUT /files/1?filename=nuevo-nombre.pdf
```

Para reemplazar el contenido:

```http
PUT /files/1?filename=nuevo-nombre.pdf
Content-Type: application/octet-stream
```

En Postman se usa **Body > binary** y se selecciona el nuevo archivo.

### Descargar archivo

```http
GET /files/1/download
```

En el navegador también se puede abrir:

```txt
http://localhost:3000/files/1/download
```

### Eliminar archivo

```http
DELETE /files/1
```

---

## 8. Estructura principal del proyecto

```txt
app.js
config/db.js
routes/todoRoutes.js
routes/fileRoutes.js
public/index.html
public/script.js
public/style.css
data/todolist.db
drive/
postman/API_REST.json
```

### Archivos importantes

- `app.js`: configura Express, CORS, JSON, archivos estáticos y rutas principales.
- `config/db.js`: conecta SQLite y crea las tablas `todos` y `files`.
- `routes/todoRoutes.js`: contiene el CRUD de tareas.
- `routes/fileRoutes.js`: contiene el CRUD de archivos del Drive local.
- `public/script.js`: contiene la lógica del navegador para consumir la API con `fetch`.
- `drive/`: carpeta donde se guardan físicamente los archivos subidos.

---

## 9. Si no cambia la pantalla

1. Cierra el servidor con `Ctrl + C`.
2. Ejecuta otra vez `npm run dev`.
3. Abre:

```txt
http://localhost:3000/app?v=final
```

4. Presiona `Ctrl + F5` en el navegador.

---

## 10. Defensa corta

Este proyecto es una TODO LIST con Express y SQLite. Tiene una API REST con operaciones GET, POST, PUT y DELETE. La pantalla está hecha con HTML, CSS y JavaScript básico, y consume la API usando `fetch`.

Los datos de tareas se guardan en la tabla `todos`. Los archivos del Drive local se guardan físicamente en la carpeta `drive/`, mientras que su información se registra en la tabla `files` de SQLite. Para los archivos se implementaron rutas para listar, subir, editar, descargar y eliminar.

El proyecto usa `async/await` porque las consultas a la base de datos y las operaciones con archivos son asíncronas. También se mantiene una estructura separada por rutas para que el código sea más ordenado y fácil de explicar.
