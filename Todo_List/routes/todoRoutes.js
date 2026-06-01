const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");

function convertirTarea(todo) {
  return {
    ...todo,
    completado: Boolean(todo.completado)
  };
}

// GET /todos
// Lista todas las tareas.
router.get("/", async (req, res) => {
  try {
    const db = getDB();

    const todos = await db.all("SELECT * FROM todos ORDER BY id DESC");

    const totalGeneral = await db.get("SELECT COUNT(*) AS total FROM todos");
    const completadas = await db.get("SELECT COUNT(*) AS total FROM todos WHERE completado = 1");
    const pendientes = await db.get("SELECT COUNT(*) AS total FROM todos WHERE completado = 0");

    res.json({
      metadata: {
        totalGeneral: totalGeneral.total,
        completadas: completadas.total,
        pendientes: pendientes.total,
        generadoEn: new Date().toISOString()
      },
      data: todos.map(convertirTarea)
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al listar tareas",
      error: error.message
    });
  }
});

// GET /todos/:id
// Busca una tarea por ID.
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();

    const todo = await db.get("SELECT * FROM todos WHERE id = ?", req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.json({
      metadata: {
        id: todo.id,
        creadoEn: todo.createdAt,
        actualizadoEn: todo.updatedAt
      },
      data: convertirTarea(todo)
    });
  } catch (error) {
    res.status(400).json({
      message: "Error al buscar tarea",
      error: error.message
    });
  }
});

// POST /todos
// Crea una tarea.
router.post("/", async (req, res) => {
  try {
    const db = getDB();

    const titulo = req.body.titulo;
    const descripcion = req.body.descripcion || "";
    const prioridad = req.body.prioridad || "media";
    const categoria = req.body.categoria || "General";
    const fechaLimite = req.body.fechaLimite || null;

    if (!titulo || titulo.trim().length < 3) {
      return res.status(400).json({ message: "El titulo debe tener al menos 3 caracteres" });
    }

    const ahora = new Date().toISOString();

    const result = await db.run(
      `INSERT INTO todos
      (titulo, descripcion, completado, prioridad, categoria, fechaLimite, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo.trim(), descripcion.trim(), 0, prioridad, categoria, fechaLimite, ahora, ahora]
    );

    const nuevaTarea = await db.get("SELECT * FROM todos WHERE id = ?", result.lastID);

    res.status(201).json({
      message: "Tarea creada correctamente",
      data: convertirTarea(nuevaTarea)
    });
  } catch (error) {
    res.status(400).json({
      message: "Error al crear tarea",
      error: error.message
    });
  }
});

// PUT /todos/:id
// Actualiza una tarea.
router.put("/:id", async (req, res) => {
  try {
    const db = getDB();

    const tarea = await db.get("SELECT * FROM todos WHERE id = ?", req.params.id);

    if (!tarea) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    const titulo = req.body.titulo ?? tarea.titulo;
    const descripcion = req.body.descripcion ?? tarea.descripcion;
    const completado = req.body.completado ?? Boolean(tarea.completado);
    const prioridad = req.body.prioridad ?? tarea.prioridad;
    const categoria = req.body.categoria ?? tarea.categoria;
    const fechaLimite = req.body.fechaLimite ?? tarea.fechaLimite;
    const ahora = new Date().toISOString();

    await db.run(
      `UPDATE todos
       SET titulo = ?, descripcion = ?, completado = ?, prioridad = ?, categoria = ?, fechaLimite = ?, updatedAt = ?
       WHERE id = ?`,
      [titulo, descripcion, completado ? 1 : 0, prioridad, categoria, fechaLimite, ahora, req.params.id]
    );

    const actualizada = await db.get("SELECT * FROM todos WHERE id = ?", req.params.id);

    res.json({
      message: "Tarea actualizada correctamente",
      data: convertirTarea(actualizada)
    });
  } catch (error) {
    res.status(400).json({
      message: "Error al actualizar tarea",
      error: error.message
    });
  }
});

// DELETE /todos/:id
// Elimina una tarea.
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();

    const tarea = await db.get("SELECT * FROM todos WHERE id = ?", req.params.id);

    if (!tarea) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    await db.run("DELETE FROM todos WHERE id = ?", req.params.id);

    res.json({
      message: "Tarea eliminada correctamente",
      data: convertirTarea(tarea)
    });
  } catch (error) {
    res.status(400).json({
      message: "Error al eliminar tarea",
      error: error.message
    });
  }
});

module.exports = router;
