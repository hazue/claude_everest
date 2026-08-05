const { peekSession, touchSession } = require('../lib/sessionStore');
const logger = require('../logger');

const COOKIE_NAME = 'prm_session';

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

// Attaches req.session (or null) based on the session cookie, without rejecting the
// request and without resetting the inactivity timer — reading session state (e.g. the
// heartbeat poll) must never itself count as activity, or idle sessions would never expire.
function attachSession(req, res, next) {
  const cookies = parseCookies(req);
  const sessionId = cookies[COOKIE_NAME];
  req.sessionId = sessionId || null;
  req.session = sessionId ? peekSession(sessionId) : null;
  logger.info('Request received', { method: req.method, path: req.originalUrl, identity: req.session?.identity });
  next();
}

// Rejects requests without a valid, non-expired session. Reaching this gate means the
// caller is a genuine authenticated action (not the heartbeat poll, which never calls
// this), so this is the one place that resets the inactivity timer.
function requireSession(req, res, next) {
  if (!req.session) {
    logger.warn('Rejected request: session expired or missing', { path: req.originalUrl });
    return res.status(401).json({ error: 'Session expired or not authenticated' });
  }
  touchSession(req.sessionId);
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session || req.session.identity.role !== role) {
      logger.warn('Rejected request: role mismatch', {
        path: req.originalUrl,
        required: role,
        actual: req.session?.identity?.role,
      });
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

module.exports = { COOKIE_NAME, attachSession, requireSession, requireRole };
