const express = require('express');
const db = require('../db');
const { findPassengerByAccessCode } = require('../lib/accessCode');
const { passengerIdentity } = require('../lib/audit');
const logger = require('../logger');

// These 3 endpoints are for card-reader hardware only. Per the spec, MAC-address
// filtering is enforced by the router/network layer (not this application), and
// one Resource has exactly one hardware unit so no Mac-Address-to-Resource binding
// is stored or checked here. These calls have no UI in front of them, so they are
// logged verbosely to make field debugging possible.

const router = express.Router();

router.post('/validate-tier', async (req, res) => {
  const { accessCode, resourceId } = req.body || {};
  if (!accessCode || !resourceId) {
    return res.status(400).json({ error: 'accessCode and resourceId are required' });
  }

  const passenger = await findPassengerByAccessCode(accessCode);
  if (!passenger) {
    logger.warn('Hardware validate-tier rejected: unknown access code', { resourceId });
    return res.status(401).json({ valid: false, reason: 'Unknown access code' });
  }

  const resource = db.prepare('SELECT * FROM Resource WHERE ResourceID = ? AND IsDeleted = 0').get(resourceId);
  if (!resource) {
    logger.warn('Hardware validate-tier rejected: unknown resource', { resourceId });
    return res.status(404).json({ valid: false, reason: 'Unknown resource' });
  }

  const tierIds = JSON.parse(resource.PassengerTierIDs);
  const valid = tierIds.includes(passenger.PassengerTierID);
  logger.info('Hardware validate-tier', { resourceId, passengerId: passenger.PassengerID, valid });
  res.json({ valid, passengerId: passenger.PassengerID });
});

router.post('/usage/start', async (req, res) => {
  const { accessCode, resourceId } = req.body || {};
  if (!accessCode || !resourceId) {
    return res.status(400).json({ error: 'accessCode and resourceId are required' });
  }

  const passenger = await findPassengerByAccessCode(accessCode);
  if (!passenger) {
    logger.warn('Hardware usage/start rejected: unknown access code', { resourceId });
    return res.status(401).json({ error: 'Unknown access code' });
  }

  const resource = db.prepare('SELECT * FROM Resource WHERE ResourceID = ? AND IsDeleted = 0').get(resourceId);
  if (!resource) {
    logger.warn('Hardware usage/start rejected: unknown resource', { resourceId });
    return res.status(404).json({ error: 'Unknown resource' });
  }

  const tierIds = JSON.parse(resource.PassengerTierIDs);
  if (!tierIds.includes(passenger.PassengerTierID)) {
    logger.warn('Hardware usage/start rejected: tier mismatch', { resourceId, passengerId: passenger.PassengerID });
    return res.status(403).json({ error: 'Passenger tier not permitted for this resource' });
  }

  const openUsage = db
    .prepare('SELECT 1 FROM PassengerResourceUsage WHERE ResourceID = ? AND ResourceUsageEndDT IS NULL')
    .get(resourceId);
  if (openUsage) {
    logger.warn('Hardware usage/start rejected: resource already in use', { resourceId });
    return res.status(409).json({ error: 'Resource is already in use' });
  }

  const info = db
    .prepare('INSERT INTO PassengerResourceUsage (PassengerID, ResourceID, CreatedBy) VALUES (?, ?, ?)')
    .run(passenger.PassengerID, resourceId, passengerIdentity(passenger.PassengerID));

  logger.info('Hardware usage/start succeeded', {
    resourceId,
    passengerId: passenger.PassengerID,
    passengerResourceUsageId: info.lastInsertRowid,
  });
  res.status(201).json({ PassengerResourceUsageID: info.lastInsertRowid });
});

router.post('/usage/end', (req, res) => {
  const { passengerResourceUsageId } = req.body || {};
  if (!passengerResourceUsageId) {
    return res.status(400).json({ error: 'passengerResourceUsageId is required' });
  }

  const usage = db
    .prepare('SELECT * FROM PassengerResourceUsage WHERE PassengerResourceUsageID = ?')
    .get(passengerResourceUsageId);
  if (!usage) {
    logger.warn('Hardware usage/end rejected: unknown usage record', { passengerResourceUsageId });
    return res.status(404).json({ error: 'Usage record not found' });
  }
  if (usage.ResourceUsageEndDT) {
    logger.warn('Hardware usage/end rejected: usage already ended', { passengerResourceUsageId });
    return res.status(409).json({ error: 'Usage already ended' });
  }

  // The passenger locking the resource is whoever the open usage row belongs to — the
  // spec assumes one resource is used by one passenger at a time, so the row itself
  // identifies the actual acting passenger without requiring the card to be re-scanned.
  db.prepare(
    `UPDATE PassengerResourceUsage
     SET ResourceUsageEndDT = datetime('now'),
         ResourceUsageTotalDuration = CAST((julianday(datetime('now')) - julianday(ResourceUsageStartDT)) * 86400 AS INTEGER),
         UpdatedBy = ?
     WHERE PassengerResourceUsageID = ?`
  ).run(passengerIdentity(usage.PassengerID), passengerResourceUsageId);

  logger.info('Hardware usage/end succeeded', { passengerResourceUsageId });
  res.json({ ok: true });
});

module.exports = router;
