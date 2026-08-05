const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { attachSession, requireSession, requireRole } = require('../middleware/auth');
const {
  crewLeadIdentity,
  insertPassengerTierAudit,
  insertPassengerAudit,
  insertResourceAudit,
} = require('../lib/audit');

const router = express.Router();
router.use(attachSession, requireSession, requireRole('CrewLead'));

function actingIdentity(req) {
  return crewLeadIdentity(req.session.identity.crewLeadId);
}

// ---- PassengerTier CRUD ----

router.get('/tiers', (req, res) => {
  res.json(db.prepare('SELECT * FROM PassengerTier WHERE IsDeleted = 0').all());
});

router.get('/tiers/:id', (req, res) => {
  const tier = db.prepare('SELECT * FROM PassengerTier WHERE PassengerTierID = ?').get(req.params.id);
  if (!tier) return res.status(404).json({ error: 'Not found' });
  res.json(tier);
});

router.post('/tiers', (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const createdBy = actingIdentity(req);

  const tx = db.transaction(() => {
    const info = db.prepare('INSERT INTO PassengerTier (PassengerTierName) VALUES (?)').run(name);
    insertPassengerTierAudit({
      passengerTierId: info.lastInsertRowid,
      action: 'Create',
      oldName: null,
      newName: name,
      createdBy,
    });
    return info.lastInsertRowid;
  });
  const id = tx();
  res.status(201).json({ PassengerTierID: id, PassengerTierName: name });
});

router.put('/tiers/:id', (req, res) => {
  const { name } = req.body || {};
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM PassengerTier WHERE PassengerTierID = ?').get(id);
  if (!existing || existing.IsDeleted) return res.status(404).json({ error: 'Not found' });
  const createdBy = actingIdentity(req);

  const tx = db.transaction(() => {
    db.prepare('UPDATE PassengerTier SET PassengerTierName = ? WHERE PassengerTierID = ?').run(name, id);
    insertPassengerTierAudit({
      passengerTierId: id,
      action: 'Update',
      oldName: existing.PassengerTierName,
      newName: name,
      createdBy,
    });
  });
  tx();
  res.json({ PassengerTierID: id, PassengerTierName: name });
});

router.delete('/tiers/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM PassengerTier WHERE PassengerTierID = ?').get(id);
  if (!existing || existing.IsDeleted) return res.status(404).json({ error: 'Not found' });

  const referencedByPassenger = db
    .prepare('SELECT 1 FROM Passenger WHERE IsDeleted = 0 AND PassengerTierID = ? LIMIT 1')
    .get(id);
  if (referencedByPassenger) {
    return res.status(409).json({ error: 'Cannot delete: tier is still assigned to a Passenger' });
  }
  const resources = db.prepare('SELECT ResourceID, PassengerTierIDs FROM Resource WHERE IsDeleted = 0').all();
  const referencedByResource = resources.some((r) => JSON.parse(r.PassengerTierIDs).includes(id));
  if (referencedByResource) {
    return res.status(409).json({ error: 'Cannot delete: tier is still referenced by a Resource' });
  }

  const createdBy = actingIdentity(req);
  const tx = db.transaction(() => {
    db.prepare('UPDATE PassengerTier SET IsDeleted = 1 WHERE PassengerTierID = ?').run(id);
    insertPassengerTierAudit({
      passengerTierId: id,
      action: 'Delete',
      oldName: existing.PassengerTierName,
      newName: null,
      createdBy,
    });
  });
  tx();
  res.json({ ok: true });
});

// ---- Passenger CRUD ----

router.get('/passengers', (req, res) => {
  res.json(
    db
      .prepare(
        `SELECT p.PassengerID, p.PassengerName, p.PassengerTierID, t.PassengerTierName
         FROM Passenger p JOIN PassengerTier t ON t.PassengerTierID = p.PassengerTierID
         WHERE p.IsDeleted = 0`
      )
      .all()
  );
});

router.get('/passengers/:id', (req, res) => {
  const passenger = db
    .prepare('SELECT PassengerID, PassengerName, PassengerTierID FROM Passenger WHERE PassengerID = ?')
    .get(req.params.id);
  if (!passenger) return res.status(404).json({ error: 'Not found' });
  res.json(passenger);
});

router.post('/passengers', async (req, res) => {
  const { name, tierId, accessCode } = req.body || {};
  if (!name || !tierId || !accessCode) {
    return res.status(400).json({ error: 'name, tierId, and accessCode are required' });
  }
  const hash = await bcrypt.hash(accessCode, 10);
  const createdBy = actingIdentity(req);

  const tx = db.transaction(() => {
    const info = db
      .prepare('INSERT INTO Passenger (PassengerAccessCode, PassengerName, PassengerTierID) VALUES (?, ?, ?)')
      .run(hash, name, tierId);
    insertPassengerAudit({
      passengerId: info.lastInsertRowid,
      action: 'Create',
      oldName: null,
      newName: name,
      oldTierId: null,
      newTierId: tierId,
      createdBy,
    });
    return info.lastInsertRowid;
  });
  const id = tx();
  res.status(201).json({ PassengerID: id, PassengerName: name, PassengerTierID: tierId });
});

router.put('/passengers/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, tierId } = req.body || {};
  const existing = db.prepare('SELECT * FROM Passenger WHERE PassengerID = ?').get(id);
  if (!existing || existing.IsDeleted) return res.status(404).json({ error: 'Not found' });
  const createdBy = actingIdentity(req);

  const newName = name ?? existing.PassengerName;
  const newTierId = tierId ?? existing.PassengerTierID;

  const tx = db.transaction(() => {
    db.prepare('UPDATE Passenger SET PassengerName = ?, PassengerTierID = ? WHERE PassengerID = ?').run(
      newName,
      newTierId,
      id
    );
    insertPassengerAudit({
      passengerId: id,
      action: 'Update',
      oldName: existing.PassengerName,
      newName,
      oldTierId: existing.PassengerTierID,
      newTierId,
      createdBy,
    });
  });
  tx();
  res.json({ PassengerID: id, PassengerName: newName, PassengerTierID: newTierId });
});

router.delete('/passengers/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM Passenger WHERE PassengerID = ?').get(id);
  if (!existing || existing.IsDeleted) return res.status(404).json({ error: 'Not found' });

  const inUse = db
    .prepare('SELECT 1 FROM PassengerResourceUsage WHERE PassengerID = ? AND ResourceUsageEndDT IS NULL LIMIT 1')
    .get(id);
  if (inUse) {
    return res.status(409).json({ error: 'Cannot delete: passenger is currently using a resource' });
  }

  const createdBy = actingIdentity(req);
  const tx = db.transaction(() => {
    db.prepare('UPDATE Passenger SET IsDeleted = 1 WHERE PassengerID = ?').run(id);
    insertPassengerAudit({
      passengerId: id,
      action: 'Delete',
      oldName: existing.PassengerName,
      newName: null,
      oldTierId: existing.PassengerTierID,
      newTierId: null,
      createdBy,
    });
  });
  tx();
  res.json({ ok: true });
});

router.get('/passengers-search', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const rows = db.prepare('SELECT PassengerID, PassengerName FROM Passenger WHERE IsDeleted = 0').all();
  res.json(rows.filter((r) => r.PassengerName.toLowerCase().includes(q)));
});

// ---- Resource CRUD ----

function tierNameById() {
  return new Map(
    db.prepare('SELECT PassengerTierID, PassengerTierName FROM PassengerTier').all().map((t) => [t.PassengerTierID, t.PassengerTierName])
  );
}

router.get('/resources', (req, res) => {
  const names = tierNameById();
  const rows = db.prepare('SELECT * FROM Resource WHERE IsDeleted = 0').all();
  const openResourceIds = new Set(
    db.prepare('SELECT ResourceID FROM PassengerResourceUsage WHERE ResourceUsageEndDT IS NULL').all().map((r) => r.ResourceID)
  );
  res.json(
    rows.map((r) => {
      const tierIds = JSON.parse(r.PassengerTierIDs);
      return {
        ...r,
        PassengerTierIDs: tierIds,
        PassengerTierNames: tierIds.map((id) => names.get(id)).filter(Boolean),
        status: openResourceIds.has(r.ResourceID) ? 'in-use' : 'available',
      };
    })
  );
});

router.get('/resources/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM Resource WHERE ResourceID = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  const openUsage = db
    .prepare(
      `SELECT u.*, p.PassengerName FROM PassengerResourceUsage u
       JOIN Passenger p ON p.PassengerID = u.PassengerID
       WHERE u.ResourceID = ? AND u.ResourceUsageEndDT IS NULL`
    )
    .get(req.params.id);
  const tierIds = JSON.parse(r.PassengerTierIDs);
  const names = tierNameById();
  res.json({
    ...r,
    PassengerTierIDs: tierIds,
    PassengerTierNames: tierIds.map((id) => names.get(id)).filter(Boolean),
    inUse: openUsage || null,
  });
});

router.post('/resources', (req, res) => {
  const { name, tierIds } = req.body || {};
  if (!name || !Array.isArray(tierIds)) {
    return res.status(400).json({ error: 'name and tierIds (array) are required' });
  }
  const createdBy = actingIdentity(req);

  const tx = db.transaction(() => {
    const info = db
      .prepare('INSERT INTO Resource (ResourceName, PassengerTierIDs) VALUES (?, ?)')
      .run(name, JSON.stringify(tierIds));
    insertResourceAudit({
      resourceId: info.lastInsertRowid,
      action: 'Create',
      oldName: null,
      newName: name,
      oldTierIds: null,
      newTierIds: tierIds,
      createdBy,
    });
    return info.lastInsertRowid;
  });
  const id = tx();
  res.status(201).json({ ResourceID: id, ResourceName: name, PassengerTierIDs: tierIds });
});

router.put('/resources/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, tierIds } = req.body || {};
  const existing = db.prepare('SELECT * FROM Resource WHERE ResourceID = ?').get(id);
  if (!existing || existing.IsDeleted) return res.status(404).json({ error: 'Not found' });
  const createdBy = actingIdentity(req);

  const newName = name ?? existing.ResourceName;
  const newTierIds = tierIds ?? JSON.parse(existing.PassengerTierIDs);

  const tx = db.transaction(() => {
    db.prepare('UPDATE Resource SET ResourceName = ?, PassengerTierIDs = ? WHERE ResourceID = ?').run(
      newName,
      JSON.stringify(newTierIds),
      id
    );
    insertResourceAudit({
      resourceId: id,
      action: 'Update',
      oldName: existing.ResourceName,
      newName,
      oldTierIds: JSON.parse(existing.PassengerTierIDs),
      newTierIds,
      createdBy,
    });
  });
  tx();
  res.json({ ResourceID: id, ResourceName: newName, PassengerTierIDs: newTierIds });
});

router.delete('/resources/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM Resource WHERE ResourceID = ?').get(id);
  if (!existing || existing.IsDeleted) return res.status(404).json({ error: 'Not found' });

  const inUse = db
    .prepare('SELECT 1 FROM PassengerResourceUsage WHERE ResourceID = ? AND ResourceUsageEndDT IS NULL LIMIT 1')
    .get(id);
  if (inUse) {
    return res.status(409).json({ error: 'Cannot delete: resource is currently in use' });
  }

  const createdBy = actingIdentity(req);
  const tx = db.transaction(() => {
    db.prepare('UPDATE Resource SET IsDeleted = 1 WHERE ResourceID = ?').run(id);
    insertResourceAudit({
      resourceId: id,
      action: 'Delete',
      oldName: existing.ResourceName,
      newName: null,
      oldTierIds: JSON.parse(existing.PassengerTierIDs),
      newTierIds: null,
      createdBy,
    });
  });
  tx();
  res.json({ ok: true });
});

// ---- Manual lock/unlock (Crew Lead initiated) ----

router.post('/resources/:id/unlock', (req, res) => {
  const resourceId = Number(req.params.id);
  const { passengerId } = req.body || {};
  if (!passengerId) return res.status(400).json({ error: 'passengerId is required' });

  const resource = db.prepare('SELECT * FROM Resource WHERE ResourceID = ? AND IsDeleted = 0').get(resourceId);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });

  const openUsage = db
    .prepare('SELECT 1 FROM PassengerResourceUsage WHERE ResourceID = ? AND ResourceUsageEndDT IS NULL')
    .get(resourceId);
  if (openUsage) return res.status(409).json({ error: 'Resource is already in use' });

  const createdBy = actingIdentity(req);
  const info = db
    .prepare(
      `INSERT INTO PassengerResourceUsage (PassengerID, ResourceID, CreatedBy) VALUES (?, ?, ?)`
    )
    .run(passengerId, resourceId, createdBy);
  res.status(201).json({ PassengerResourceUsageID: info.lastInsertRowid });
});

router.post('/resources/:id/lock', (req, res) => {
  const resourceId = Number(req.params.id);
  const openUsage = db
    .prepare('SELECT * FROM PassengerResourceUsage WHERE ResourceID = ? AND ResourceUsageEndDT IS NULL')
    .get(resourceId);
  if (!openUsage) return res.status(409).json({ error: 'Resource is not currently in use' });

  const updatedBy = actingIdentity(req);
  db.prepare(
    `UPDATE PassengerResourceUsage
     SET ResourceUsageEndDT = datetime('now'),
         ResourceUsageTotalDuration = CAST((julianday(datetime('now')) - julianday(ResourceUsageStartDT)) * 86400 AS INTEGER),
         UpdatedBy = ?
     WHERE PassengerResourceUsageID = ?`
  ).run(updatedBy, openUsage.PassengerResourceUsageID);
  res.json({ ok: true });
});

// ---- Usage Reports ----

router.get('/reports/by-passenger', (req, res) => {
  const { from, to } = req.query;
  const rows = db
    .prepare(
      `SELECT p.PassengerID, p.PassengerName,
              SUM(CASE WHEN u.ResourceUsageEndDT IS NOT NULL THEN u.ResourceUsageTotalDuration ELSE 0 END) AS TotalDurationSeconds,
              SUM(CASE WHEN u.ResourceUsageEndDT IS NULL THEN 1 ELSE 0 END) AS InUseCount
       FROM PassengerResourceUsage u
       JOIN Passenger p ON p.PassengerID = u.PassengerID
       WHERE (? IS NULL OR u.ResourceUsageStartDT >= ?)
         AND (? IS NULL OR u.ResourceUsageStartDT <= ?)
       GROUP BY p.PassengerID, p.PassengerName
       ORDER BY p.PassengerName`
    )
    .all(from || null, from || null, to || null, to || null);
  res.json(rows.map((r) => ({ ...r, status: r.InUseCount > 0 ? 'In-Use' : 'Completed' })));
});

router.get('/reports/by-resource', (req, res) => {
  const { from, to } = req.query;
  const rows = db
    .prepare(
      `SELECT r.ResourceID, r.ResourceName,
              SUM(CASE WHEN u.ResourceUsageEndDT IS NOT NULL THEN u.ResourceUsageTotalDuration ELSE 0 END) AS TotalDurationSeconds,
              SUM(CASE WHEN u.ResourceUsageEndDT IS NULL THEN 1 ELSE 0 END) AS InUseCount
       FROM PassengerResourceUsage u
       JOIN Resource r ON r.ResourceID = u.ResourceID
       WHERE (? IS NULL OR u.ResourceUsageStartDT >= ?)
         AND (? IS NULL OR u.ResourceUsageStartDT <= ?)
       GROUP BY r.ResourceID, r.ResourceName
       ORDER BY r.ResourceName`
    )
    .all(from || null, from || null, to || null, to || null);
  res.json(rows.map((r) => ({ ...r, status: r.InUseCount > 0 ? 'In-Use' : 'Completed' })));
});

// ---- Audit report views (include soft-deleted parent records) ----

router.get('/audits/passenger-tier', (req, res) => {
  res.json(db.prepare('SELECT * FROM PassengerTierAudit ORDER BY CreatedOn DESC').all());
});

router.get('/audits/passenger', (req, res) => {
  res.json(db.prepare('SELECT * FROM PassengerAudit ORDER BY CreatedOn DESC').all());
});

router.get('/audits/resource', (req, res) => {
  res.json(db.prepare('SELECT * FROM ResourceAudit ORDER BY CreatedOn DESC').all());
});

module.exports = router;
