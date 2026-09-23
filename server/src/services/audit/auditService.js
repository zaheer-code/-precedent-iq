import { query } from '../../config/db.js';

/**
 * Sanitizes metadata to ensure no passwords, secrets, or raw auth tokens are logged.
 */
function sanitizeMetadata(metadata = {}) {
  const sensitiveKeys = ['password', 'password_hash', 'token', 'jwt', 'secret', 'apiKey', 'gemini_key'];
  const sanitized = { ...metadata };

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
}

/**
 * Logs a security or user action to the audit_logs table.
 */
export async function logAudit({ userId = null, matterId = null, action, metadata = {} }) {
  try {
    const cleanMeta = sanitizeMetadata(metadata);
    await query(
      `INSERT INTO audit_logs (user_id, matter_id, action, metadata, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, matterId, action, JSON.stringify(cleanMeta)]
    );
  } catch (error) {
    // Non-blocking logging failure
    console.error('[Audit Log Error]:', error.message);
  }
}
