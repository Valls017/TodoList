const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { getDB } = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const drivePath = path.join(__dirname, "..", "drive");

router.use(authMiddleware);

function asegurarDrive() {
  if (!fs.existsSync(drivePath)) {
    fs.mkdirSync(drivePath, { recursive: true });
  }
}

function limpiarNombreArchivo(nombre) {
  return String(nombre || "archivo")
    .replace(/[\\/:*?"<>|]/g, "_")
    .trim() || "archivo";
}

function crearNombreGuardado(nombreOriginal) {
  const extension = path.extname(nombreOriginal);
  const base = path.basename(nombreOriginal, extension).replace(/\s+/g, "_");
  const unico = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
  return `${unico}_${base}${extension}`;
}

function convertirArchivo(archivo) {
  return {
    id: archivo.id,
    originalName: archivo.originalName,
    storedName: archivo.storedName,
    mimeType: archivo.mimeType,
    size: archivo.size,
    createdAt: archivo.createdAt,
    updatedAt: archivo.updatedAt,
    downloadUrl: `/files/${archivo.id}/download`
  };
}

// GET /files
// Lista todos los archivos guardados en el drive local.
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const archivos = await db.all("SELECT * FROM files WHERE userId = ? ORDER BY id DESC", req.user.id);

    res.json({
      metadata: {
        total: archivos.length,
        generadoEn: new Date().toISOString()
      },
      data: archivos.map(convertirArchivo)
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al listar archivos",
      error: error.message
    });
  }
});

// GET /files/:id
// Busca la informacion de un archivo por ID.
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const archivo = await db.get("SELECT * FROM files WHERE id = ? AND userId = ?", [req.params.id, req.user.id]);

    if (!archivo) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    res.json({
      metadata: {
        id: archivo.id,
        creadoEn: archivo.createdAt,
        actualizadoEn: archivo.updatedAt
      },
      data: convertirArchivo(archivo)
    });
  } catch (error) {
    res.status(400).json({
      message: "Error al buscar archivo",
      error: error.message
    });
  }
});

// POST /files?filename=nombre.pdf
// Sube un archivo al drive local.
// El contenido del archivo viaja en el body como application/octet-stream.
router.post(
  "/",
  express.raw({ type: "*/*", limit: "25mb" }),
  async (req, res) => {
    try {
      asegurarDrive();
      const db = getDB();

      const nombreOriginal = limpiarNombreArchivo(req.query.filename || req.headers["x-file-name"]);
      const mimeType = req.headers["content-type"] || "application/octet-stream";
      const contenido = Buffer.isBuffer(req.body) ? req.body : Buffer.from([]);

      if (!contenido.length) {
        return res.status(400).json({ message: "Debe enviar un archivo con contenido" });
      }

      const storedName = crearNombreGuardado(nombreOriginal);
      const rutaArchivo = path.join(drivePath, storedName);
      const ahora = new Date().toISOString();

      await fs.promises.writeFile(rutaArchivo, contenido);

      const result = await db.run(
        `INSERT INTO files
        (userId, originalName, storedName, mimeType, size, path, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, nombreOriginal, storedName, mimeType, contenido.length, rutaArchivo, ahora, ahora]
      );

      const nuevoArchivo = await db.get("SELECT * FROM files WHERE id = ?", result.lastID);

      res.status(201).json({
        message: "Archivo subido correctamente al drive local",
        data: convertirArchivo(nuevoArchivo)
      });
    } catch (error) {
      res.status(400).json({
        message: "Error al subir archivo",
        error: error.message
      });
    }
  }
);

// PUT /files/:id?filename=nuevo-nombre.pdf
// Edita un archivo: puede cambiar el nombre y/o reemplazar el contenido.
router.put(
  "/:id",
  express.raw({ type: "*/*", limit: "25mb" }),
  async (req, res) => {
    try {
      asegurarDrive();
      const db = getDB();
      const archivo = await db.get("SELECT * FROM files WHERE id = ? AND userId = ?", [req.params.id, req.user.id]);

      if (!archivo) {
        return res.status(404).json({ message: "Archivo no encontrado" });
      }

      const nuevoNombre = req.query.filename || req.headers["x-file-name"];
      const nombreOriginal = nuevoNombre ? limpiarNombreArchivo(nuevoNombre) : archivo.originalName;
      const mimeType = req.headers["content-type"] || archivo.mimeType;
      const contenido = Buffer.isBuffer(req.body) ? req.body : Buffer.from([]);
      const ahora = new Date().toISOString();

      let nuevoTamano = archivo.size;

      if (contenido.length) {
        await fs.promises.writeFile(archivo.path, contenido);
        nuevoTamano = contenido.length;
      }

      await db.run(
        `UPDATE files
         SET originalName = ?, mimeType = ?, size = ?, updatedAt = ?
         WHERE id = ?`,
        [nombreOriginal, mimeType, nuevoTamano, ahora, req.params.id]
      );

      const actualizado = await db.get("SELECT * FROM files WHERE id = ?", req.params.id);

      res.json({
        message: "Archivo editado correctamente",
        data: convertirArchivo(actualizado)
      });
    } catch (error) {
      res.status(400).json({
        message: "Error al editar archivo",
        error: error.message
      });
    }
  }
);

// GET /files/:id/download
// Descarga el archivo guardado.
router.get("/:id/download", async (req, res) => {
  try {
    const db = getDB();
    const archivo = await db.get("SELECT * FROM files WHERE id = ? AND userId = ?", [req.params.id, req.user.id]);

    if (!archivo) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    if (!fs.existsSync(archivo.path)) {
      return res.status(404).json({ message: "El archivo fisico no existe en el drive local" });
    }

    res.download(archivo.path, archivo.originalName);
  } catch (error) {
    res.status(400).json({
      message: "Error al descargar archivo",
      error: error.message
    });
  }
});

// DELETE /files/:id
// Elimina el archivo fisico y su registro en SQLite.
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const archivo = await db.get("SELECT * FROM files WHERE id = ? AND userId = ?", [req.params.id, req.user.id]);

    if (!archivo) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    if (fs.existsSync(archivo.path)) {
      await fs.promises.unlink(archivo.path);
    }

    await db.run("DELETE FROM files WHERE id = ? AND userId = ?", [req.params.id, req.user.id]);

    res.json({
      message: "Archivo eliminado correctamente",
      data: convertirArchivo(archivo)
    });
  } catch (error) {
    res.status(400).json({
      message: "Error al eliminar archivo",
      error: error.message
    });
  }
});

module.exports = router;
