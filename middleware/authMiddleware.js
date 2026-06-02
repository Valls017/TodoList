const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secreto123";

function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no enviado" });
  }

  const token = authorization.split(" ")[1];

  try {
    const usuario = jwt.verify(token, JWT_SECRET);
    req.user = usuario;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token invalido o expirado",
      error: error.message
    });
  }
}

module.exports = authMiddleware;
