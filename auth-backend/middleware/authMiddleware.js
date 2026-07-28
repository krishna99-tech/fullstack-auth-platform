const jwt = require('jsonwebtoken');
const prisma = require('../db');

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;

    // 3. Verify session still exists in DB
    const session = await prisma.session.findUnique({
      where: { token }
    });

    if (!session) {
      // Session was revoked or deleted
      return res.status(401).json({ error: 'Unauthorized: Session revoked or expired' });
    }

    // 4. Update lastActive timestamp in background
    prisma.session.update({
      where: { id: session.id },
      data: { lastActive: new Date().toISOString() }
    }).catch(err => console.error('Failed to update session activity:', err));

    req.sessionId = session.id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Token expired' });
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = authMiddleware;
