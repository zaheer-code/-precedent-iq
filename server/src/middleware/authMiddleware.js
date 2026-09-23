import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { query } from '../config/db.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token is required'
    });
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    
    // Verify user still exists in database
    const userResult = await query(
      'SELECT id, full_name, email, created_at FROM users WHERE id = $1',
      [decoded.userId || decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User session invalid or user no longer exists'
      });
    }

    req.user = {
      id: userResult.rows[0].id,
      email: userResult.rows[0].email,
      fullName: userResult.rows[0].full_name,
      createdAt: userResult.rows[0].created_at
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Authentication token has expired. Please log in again.'
      });
    }
    return res.status(403).json({
      success: false,
      error: 'Invalid authentication token'
    });
  }
}
