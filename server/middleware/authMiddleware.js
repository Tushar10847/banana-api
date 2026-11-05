/**
 * CIS046-3 Software For Enterprise
 * THEME 4: VIRTUAL IDENTITY
 * 
 * Middleware to verify JSON Web Tokens (JWT) ensuring all game actions,
 * profile modifications, and score records are strictly bound to an authentic virtual identity.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'banana_enterprise_secret_jwt_key_2026';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: You must be logged in with a valid Virtual Identity to play.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, email }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.'
    });
  }
}

module.exports = {
  requireAuth,
  JWT_SECRET
};
