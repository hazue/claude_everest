const express = require('express');
const { findCrewLeadByAccessCode, findPassengerByAccessCode } = require('../lib/accessCode');
const { createSession, destroySession, peekSession, remainingMs, IDLE_TIMEOUT_MS } = require('../lib/sessionStore');
const { COOKIE_NAME, attachSession, requireSession } = require('../middleware/auth');
const logger = require('../logger');

const router = express.Router();
router.use(attachSession);

function setSessionCookie(res, sessionId) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(sessionId)}; HttpOnly; Path=/; SameSite=Strict`
  );
}

router.post('/passenger/login', async (req, res) => {
  const { accessCode } = req.body || {};
  if (!accessCode) return res.status(400).json({ error: 'accessCode is required' });

  const passenger = await findPassengerByAccessCode(accessCode);
  if (!passenger) {
    logger.warn('Passenger login failed');
    return res.status(401).json({ error: 'Invalid access code' });
  }

  const sessionId = createSession({
    role: 'Passenger',
    passengerId: passenger.PassengerID,
    name: passenger.PassengerName,
  });
  setSessionCookie(res, sessionId);
  logger.info('Passenger login succeeded', { passengerId: passenger.PassengerID });
  res.json({ role: 'Passenger', name: passenger.PassengerName, idleTimeoutMs: IDLE_TIMEOUT_MS });
});

router.post('/crewlead/login', async (req, res) => {
  const { accessCode } = req.body || {};
  if (!accessCode) return res.status(400).json({ error: 'accessCode is required' });

  const crewLead = await findCrewLeadByAccessCode(accessCode);
  if (!crewLead) {
    logger.warn('CrewLead login failed');
    return res.status(401).json({ error: 'Invalid access code' });
  }

  const sessionId = createSession({
    role: 'CrewLead',
    crewLeadId: crewLead.CrewLeadID,
    name: crewLead.CrewLeadName,
  });
  setSessionCookie(res, sessionId);
  logger.info('CrewLead login succeeded', { crewLeadId: crewLead.CrewLeadID });
  res.json({ role: 'CrewLead', name: crewLead.CrewLeadName, idleTimeoutMs: IDLE_TIMEOUT_MS });
});

router.post('/logout', (req, res) => {
  if (req.sessionId) {
    logger.info('Logout', { identity: req.session?.identity });
    destroySession(req.sessionId);
  }
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`);
  res.json({ ok: true });
});

// Polled by the client to drive the inactivity countdown and detect expiry.
// Reading via peekSession (not requireSession) is deliberate: this poll must never
// itself count as activity, or an idle session would never expire.
router.get('/heartbeat', (req, res) => {
  const session = req.sessionId ? peekSession(req.sessionId) : null;
  if (!session) return res.status(401).json({ error: 'Session expired' });
  res.json({
    identity: session.identity,
    remainingMs: remainingMs(req.sessionId),
  });
});

// Called only when the user explicitly clicks "Resume session" on the expiry warning —
// this is genuine activity, so it goes through requireSession and resets the idle clock.
router.post('/touch', requireSession, (req, res) => {
  res.json({ ok: true, remainingMs: remainingMs(req.sessionId) });
});

module.exports = router;
