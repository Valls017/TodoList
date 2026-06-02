function getJwtSecret() {
  return process.env.JWT_SECRET || "secreto123";
}

module.exports = { getJwtSecret };
