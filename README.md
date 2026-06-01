# TodoList
Este proyecto es una TodoList

## ¿Qué hace el proyecto?
Este proyecto es una Lista de Tareas básica desarrollada con Node.js, Express y SQLite.
El sistema permite realizar las siguientes acciones:
- Añadir una nueva tarea.
- Editar una tarea existente.
- Marcar una tarea como completada.
- Eliminar una tarea.

Además incluye un **Drive de archivos** que permite:
- Subir archivos al servidor.
- Ver la lista de archivos subidos.
- Descargar un archivo.
- Editar el nombre o reemplazar el contenido de un archivo.
- Eliminar un archivo.

La aplicación tiene una pantalla sencilla desarrollada con HTML, CSS y JavaScript.
La información se almacena en una base de datos SQLite y se maneja mediante una API REST.
Las operaciones principales de la API son:

```txt
GET    → consultar tareas o archivos
POST   → crear tareas o subir archivos
PUT    → actualizar tareas o editar archivos
DELETE → eliminar tareas o archivos
```

---

## Tecnologías utilizadas
- Node.js
- Express
- SQLite
- HTML
- CSS
- JavaScript
- Postman para pruebas

---

## Requisitos
Antes de ejecutar el proyecto se debe tener instalado:
- Node.js
- npm

Para verificar si están instalados:
```bash
node -v
npm -v
```

---

## Instalación del proyecto
Primero se debe descargar o clonar el repositorio.
Luego entrar a la carpeta del proyecto desde la terminal:
```bash
cd Todo_List
```
Después instalar las dependencias:
```bash
npm install
```
Este comando crea la carpeta `node_modules`.
La carpeta `node_modules` no se sube a GitHub porque es muy pesada.  
Se genera automáticamente con `npm install`.

---

## Configuración
El proyecto usa un archivo `.env` para la configuración.
Crear el archivo `.env` copiando el archivo `.env.example`.

En Windows:
```bash
copy .env.example .env
```

El archivo `.env` debe contener:
```env
PORT=3000
DB_FILE=./data/todolist.db
```

---

## Ejecutar el proyecto
Para iniciar el servidor en modo desarrollo:
```bash
npm run dev
```
Si todo está correcto, debe aparecer algo parecido a:
```txt
Conectado correctamente a SQLite
Servidor corriendo en http://localhost:3000
Pantalla: http://localhost:3000/app
API: http://localhost:3000/todos
```

---

## Abrir la pantalla
En el navegador abrir:
```txt
Pantalla: http://localhost:3000/app
API:      http://localhost:3000/todos
```

---

## Endpoints de la API

### Tareas `/todos`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/todos` | Lista todas las tareas |
| GET | `/todos/:id` | Busca una tarea por ID |
| POST | `/todos` | Crea una tarea |
| PUT | `/todos/:id` | Actualiza una tarea |
| DELETE | `/todos/:id` | Elimina una tarea |

### Drive `/files`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/files` | Lista todos los archivos |
| GET | `/files/:id` | Busca un archivo por ID |
| POST | `/files?filename=nombre.pdf` | Sube un archivo |
| PUT | `/files/:id?filename=nuevo.pdf` | Edita nombre o reemplaza contenido |
| GET | `/files/:id/download` | Descarga el archivo |
| DELETE | `/files/:id` | Elimina el archivo |

---

## Estructura del proyecto
```txt
TodoList/
├── app.js
├── package.json
├── .env.example
├── config/
│   └── db.js
├── routes/
│   ├── todoRoutes.js
│   └── fileRoutes.js
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── drive/
│   └── .gitkeep
├── data/
│   └── todolist.db
└── postman/
    └── API_REST.json
```
