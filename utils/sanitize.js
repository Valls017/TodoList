const validator = require("validator");

function sanitizarTexto(texto) {
  if (!texto) return "";
  return validator.escape(texto.trim());
}

function sanitizarEmail(email) {
  if (!email) return "";
  return validator.normalizeEmail(email.trim());
}

module.exports = { sanitizarTexto, sanitizarEmail };