const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const { connectDB } = require("./config/db");
const todoRoutes = require("./routes/todoRoutes");
const fileRoutes = require("./routes/fileRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
const app = express();

// ETag HTTP. Sirve para que Express mande un identificador de versión de la respuesta en los headers.
app.set("etag", "strong");

app.use(cors());

// Permite leer JSON que llega desde Postman o desde fetch.
app.use(express.json());

// Pantalla básica con HTML, CSS y JavaScript. No usa Pug.
app.use("/app", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.json({
    message: "API REST TODO LIST funcionando",
    database: "SQLite",
    pantalla: "/app",
    endpoints: {
      health: "/health",
      authRegister: "/auth/register",
      authLogin: "/auth/login",
      todos: "/todos",
      todoById: "/todos/:id",
      files: "/files",
      fileById: "/files/:id",
      fileDownload: "/files/:id/download"
    }
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "TODO LIST API",
    database: "SQLite",
    timestamp: new Date().toISOString()
  });
});

// Todas las rutas de autenticacion empiezan con /auth.
app.use("/auth", authRoutes);

// Todas las rutas de tareas empiezan con /todos.
app.use("/todos", todoRoutes);

// Todas las rutas de archivos empiezan con /files.
app.use("/files", fileRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Pantalla: http://localhost:${PORT}/app`);
    console.log(`Auth: http://localhost:${PORT}/auth/login`);
    console.log(`API: http://localhost:${PORT}/todos`);
  });
}

const errorHandler = require("./middleware/errorMiddleware");

app.use(errorHandler);
startServer();
