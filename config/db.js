const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db = null;

async function connectDB() {
  db = await open({
    filename: process.env.DB_FILE || "./data/todolist.db",
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id),
      titulo TEXT NOT NULL,
      descripcion TEXT DEFAULT '',
      completado INTEGER DEFAULT 0,
      prioridad TEXT DEFAULT 'media',
      categoria TEXT DEFAULT 'General',
      fechaLimite TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Migracion: agregar userId si la tabla ya existia sin esa columna
  await db.exec(`ALTER TABLE todos ADD COLUMN userId INTEGER`).catch(() => {});

  await db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id),
      originalName TEXT NOT NULL,
      storedName TEXT NOT NULL,
      mimeType TEXT DEFAULT 'application/octet-stream',
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Migracion: agregar userId si la tabla ya existia sin esa columna
  await db.exec(`ALTER TABLE files ADD COLUMN userId INTEGER`).catch(() => {});

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  console.log("Conectado correctamente a SQLite");
}

function getDB() {
  if (!db) {
    throw new Error("La base de datos no esta conectada");
  }

  return db;
}

module.exports = { connectDB, getDB };