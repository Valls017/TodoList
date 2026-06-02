function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET no configurado en .env");
  }

  return secret;
}

module.exports = { getJwtSecret };
