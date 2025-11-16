const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'TU_SECRETO_AQUI';

function auth(req, res, next) {
  let token = null;

  // Intentar cookie HttpOnly
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Si no hay cookie, permitir Authorization header (Bearer) — útil si en algún futuro Unity usa token
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // datos del capacitador
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

module.exports = auth;
