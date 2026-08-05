const test = require('node:test');
const assert = require('node:assert');

process.env.SESSION_IDLE_TIMEOUT_MS = '100';
const { createSession, getSession, peekSession, destroySession } = require('../src/lib/sessionStore');

test('session is retrievable immediately after creation', () => {
  const id = createSession({ role: 'Passenger', passengerId: 1 });
  assert.ok(getSession(id));
});

test('session expires after the idle timeout elapses', async () => {
  const id = createSession({ role: 'Passenger', passengerId: 1 });
  await new Promise((r) => setTimeout(r, 150));
  assert.strictEqual(getSession(id), null);
});

test('destroyed session cannot be retrieved', () => {
  const id = createSession({ role: 'CrewLead', crewLeadId: 1 });
  destroySession(id);
  assert.strictEqual(getSession(id), null);
});

test('peekSession does not reset the inactivity timer', async () => {
  const id = createSession({ role: 'Passenger', passengerId: 1 });
  await new Promise((r) => setTimeout(r, 60));
  peekSession(id); // should NOT refresh lastActivity
  await new Promise((r) => setTimeout(r, 60));
  assert.strictEqual(getSession(id), null); // 120ms since creation > 100ms timeout
});
