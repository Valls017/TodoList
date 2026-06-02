const PRIORIDADES_VALIDAS = ["alta", "media", "baja"];

function validarTodo(req, res, next) {
  const { titulo, prioridad } = req.body;
  const errores = [];

  // Validar título
  if (!titulo || titulo.trim().length < 3) {
    errores.push("El título debe tener al menos 3 caracteres");
  }
  if (titulo && titulo.trim().length > 100) {
    errores.push("El título no puede superar los 100 caracteres");
  }

  // Validar prioridad
  if (prioridad && !PRIORIDADES_VALIDAS.includes(prioridad)) {
    errores.push("La prioridad debe ser alta, media o baja");
  }

  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  next();
}

module.exports = { validarTodo };