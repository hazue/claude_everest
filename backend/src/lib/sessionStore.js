const crypto = require('crypto');

const IDLE_TIMEOUT_MS = Number(process.env.SESSION_IDLE_TIMEOUT_MS || 60000);

// In-memory session store. Sessions expire after IDLE_TIMEOUT_MS of inactivity.
const sessions = new Map();

function createSession(identity) {
  const id = crypto.randomBytes(24).toString('hex');
  sessions.set(id, { identity, lastActivity: Date.now() });
  return id;
}

function getSession(id) {
  const session = sessions.get(id);
  if (!session) return null;
  if (Date.now() - session.lastActivity > IDLE_TIMEOUT_MS) {
    sessions.delete(id);
    return null;
  }
  session.lastActivity = Date.now();
  return session;
}

// Reads session state without resetting the inactivity timer (used by the heartbeat endpoint).
function peekSession(id) {
  const session = sessions.get(id);
  if (!session) return null;
  if (Date.now() - session.lastActivity > IDLE_TIMEOUT_MS) {
    sessions.delete(id);
    return null;
  }
  return session;
}

// Explicitly resets the inactivity timer. Used only where a request represents
// genuine user activity — never by the heartbeat poll itself (see peekSession).
function touchSession(id) {
  const session = sessions.get(id);
  if (session) session.lastActivity = Date.now();
}

function destroySession(id) {
  sessions.delete(id);
}

function remainingMs(id) {
  const session = sessions.get(id);
  if (!session) return 0;
  return Math.max(0, IDLE_TIMEOUT_MS - (Date.now() - session.lastActivity));
}

module.exports = { createSession, getSession, peekSession, touchSession, destroySession, remainingMs, IDLE_TIMEOUT_MS };
