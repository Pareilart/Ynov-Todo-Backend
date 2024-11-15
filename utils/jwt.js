const jwt = require('jsonwebtoken');

// Clé secrète (à ne pas exposer dans le code source)
const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète';

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { generateToken };
