const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db");
const { getJwtSecret } = require("../config/auth");
const { validarRegistro, validarLogin } = require("../validators/authValidator");
const { sanitizarTexto, sanitizarEmail } = require("../utils/sanitize");

const router = express.Router();

// REGISTRO
router.post("/register", validarRegistro, async (req, res) => {
  const nombre = sanitizarTexto(req.body.nombre);
  const email = sanitizarEmail(req.body.email);
  const { password } = req.body;

  try {
    const db = getDB();
    const passwordHash = await bcrypt.hash(password, 10);
    const ahora = new Date().toISOString();

    await db.run(
      "INSERT INTO users (nombre, email, password, createdAt) VALUES (?, ?, ?, ?)",
      [nombre, email, passwordHash, ahora]
    );

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    if (error.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// LOGIN
router.post("/login", validarLogin, async (req, res) => {
  const email = sanitizarEmail(req.body.email);
  const { password } = req.body;

  try {
    const db = getDB();
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    const passwordValida = await bcrypt.compare(password, user.password);

    if (!passwordValida) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: "24h" }
    );

    res.json({ token, nombre: user.nombre });
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

module.exports = router;
