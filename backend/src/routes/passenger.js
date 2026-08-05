const express = require('express');
const db = require('../db');
const { attachSession, requireSession, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(attachSession, requireSession, requireRole('Passenger'));

router.get('/profile', (req, res) => {
  const { passengerId } = req.session.identity;
  const passenger = db
    .prepare(
      `SELECT p.PassengerID, p.PassengerName, p.PassengerTierID, t.PassengerTierName
       FROM Passenger p JOIN PassengerTier t ON t.PassengerTierID = p.PassengerTierID
       WHERE p.PassengerID = ? AND p.IsDeleted = 0`
    )
    .get(passengerId);
  if (!passenger) return res.status(404).json({ error: 'Passenger not found' });
  res.json(passenger);
});

// Read-only per spec — this page never accepts a lock/unlock action from the web
// session; the physical card reader talks to the hardware-only endpoints instead.
// Each resource is annotated with its current usage status so the UI can show
// Available / In-Use / "in use by you" without a second round trip.
router.get('/resources', (req, res) => {
  const { passengerId } = req.session.identity;
  const passenger = db.prepare('SELECT PassengerTierID FROM Passenger WHERE PassengerID = ?').get(passengerId);
  const resources = db.prepare('SELECT * FROM Resource WHERE IsDeleted = 0').all();
  const tierNameById = new Map(
    db.prepare('SELECT PassengerTierID, PassengerTierName FROM PassengerTier').all().map((t) => [t.PassengerTierID, t.PassengerTierName])
  );
  const openUsageByResource = new Map(
    db
      .prepare('SELECT * FROM PassengerResourceUsage WHERE ResourceUsageEndDT IS NULL')
      .all()
      .map((u) => [u.ResourceID, u])
  );

  const visible = resources
    .filter((r) => JSON.parse(r.PassengerTierIDs).includes(passenger.PassengerTierID))
    .map((r) => {
      const tierIds = JSON.parse(r.PassengerTierIDs);
      const openUsage = openUsageByResource.get(r.ResourceID);
      let status = 'available';
      if (openUsage) status = openUsage.PassengerID === passengerId ? 'locked-you' : 'in-use';
      return {
        ...r,
        PassengerTierIDs: tierIds,
        PassengerTierNames: tierIds.map((id) => tierNameById.get(id)).filter(Boolean),
        status,
        usageStartedAt: openUsage && status === 'locked-you' ? openUsage.ResourceUsageStartDT : null,
      };
    });
  res.json(visible);
});

router.get('/history', (req, res) => {
  const { passengerId } = req.session.identity;
  const rows = db
    .prepare(
      `SELECT u.*, r.ResourceName
       FROM PassengerResourceUsage u JOIN Resource r ON r.ResourceID = u.ResourceID
       WHERE u.PassengerID = ? AND u.ResourceUsageEndDT IS NOT NULL
       ORDER BY u.ResourceUsageStartDT DESC`
    )
    .all(passengerId);
  res.json(rows);
});

module.exports = router;
