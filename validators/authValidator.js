function validarRegistro(req, res, next) {
  const { nombre, email, password } = req.body;
  const errores = [];

  // Validar nombre
  if (!nombre || nombre.trim().length < 2) {
    errores.push("El nombre debe tener al menos 2 caracteres");
  }
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
    errores.push("El nombre solo puede contener letras");
  }

  // Validar email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errores.push("El email no tiene un formato válido");
  }

  // Validar password
  if (!password || password.length < 8) {
    errores.push("La contraseña debe tener al menos 8 caracteres");
  }

  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  next();
}

function validarLogin(req, res, next) {
  const { email, password } = req.body;
  const errores = [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errores.push("El email no tiene un formato válido");
  }

  if (!password) {
    errores.push("La contraseña es obligatoria");
  }

  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  next();
}

module.exports = { validarRegistro, validarLogin };