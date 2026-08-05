const bcrypt = require('bcrypt');
const db = require('../db');
const logger = require('../logger');

// Access codes are stored as one-way bcrypt hashes. There is no decrypt path;
// authentication only ever compares a raw scanned code against stored hashes.
// Never log the raw or hashed access code itself.

async function findCrewLeadByAccessCode(rawCode) {
  const rows = db.prepare('SELECT * FROM CrewLead').all();
  for (const row of rows) {
    if (await bcrypt.compare(rawCode, row.CrewLeadAccessCode)) {
      logger.info('CrewLead access code matched', { crewLeadId: row.CrewLeadID });
      return row;
    }
  }
  logger.warn('CrewLead access code lookup failed: no match');
  return null;
}

async function findPassengerByAccessCode(rawCode) {
  const rows = db.prepare('SELECT * FROM Passenger WHERE IsDeleted = 0').all();
  for (const row of rows) {
    if (await bcrypt.compare(rawCode, row.PassengerAccessCode)) {
      logger.info('Passenger access code matched', { passengerId: row.PassengerID });
      return row;
    }
  }
  logger.warn('Passenger access code lookup failed: no match');
  return null;
}

module.exports = { findCrewLeadByAccessCode, findPassengerByAccessCode };
