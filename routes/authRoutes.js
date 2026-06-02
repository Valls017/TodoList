const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { getDB } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "secreto123";

function convertirUsuario(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    createdAt: usuario.createdAt
  };
}

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

router.post("/register", async (req, res) => {
  try {
    const db = getDB();
    const nombre = String(req.body.nombre || "").trim();
    const email = normalizarEmail(req.body.email);
    const password = String(req.body.password || "");

    if (nombre.length < 2) {
      return res.status(400).json({ message: "El nombre debe tener al menos 2 caracteres" });
    }

    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Debe enviar un email valido" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "La password debe tener al menos 6 caracteres" });
    }

    const usuarioExistente = await db.get("SELECT id FROM users WHERE email = ?", email);

    if (usuarioExistente) {
      return res.status(409).json({ message: "Ya existe un usuario con ese email" });
    }

    const ahora = new Date().toISOString();
    const passwordEncriptada = await bcrypt.hash(password, 10);

    const result = await db.run(
      `INSERT INTO users (nombre, email, password, createdAt)
       VALUES (?, ?, ?, ?)`,
      [nombre, email, passwordEncriptada, ahora]
    );

    const usuario = await db.get(
      "SELECT id, nombre, email, createdAt FROM users WHERE id = ?",
      result.lastID
    );

    res.status(201).json({
      message: "Usuario registrado correctamente",
      data: convertirUsuario(usuario)
    });
  } catch (error) {
    res.status(400).json({
      message: "Error al registrar usuario",
      error: error.message
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const db = getDB();
    const email = normalizarEmail(req.body.email);
    const password = String(req.body.password || "");

    const usuario = await db.get("SELECT * FROM users WHERE email = ?", email);
    const passwordCorrecta = usuario
      ? await bcrypt.compare(password, usuario.password)
      : false;

    if (!usuario || !passwordCorrecta) {
      return res.status(401).json({ message: "Email o password incorrectos" });
    }

    const usuarioSeguro = convertirUsuario(usuario);
    const token = jwt.sign(usuarioSeguro, JWT_SECRET, { expiresIn: "24h" });

    return res.json({
      message: "Login correcto",
      token,
      data: usuarioSeguro
    });
  } catch (error) {
    res.status(400).json({
      message: "Error al iniciar sesion",
      error: error.message
    });
  }
});

module.exports = router;
