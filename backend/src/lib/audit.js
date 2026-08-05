const db = require('../db');
const logger = require('../logger');

// CreatedBy for audit rows must be a CrewLead identity, e.g. "CrewLead_001".
function crewLeadIdentity(crewLeadId) {
  return `CrewLead_${String(crewLeadId).padStart(3, '0')}`;
}

// CreatedBy/UpdatedBy on PassengerResourceUsage rows use the same zero-padded form
// for a Passenger-initiated action, e.g. "Passenger_001".
function passengerIdentity(passengerId) {
  return `Passenger_${String(passengerId).padStart(3, '0')}`;
}

function insertPassengerTierAudit({ passengerTierId, action, oldName, newName, createdBy }) {
  db.prepare(
    `INSERT INTO PassengerTierAudit
      (PassengerTierID, Action, Old_PassengerTierName, New_PassengerTierName, CreatedBy)
     VALUES (?, ?, ?, ?, ?)`
  ).run(passengerTierId, action, oldName ?? null, newName ?? null, createdBy);
  logger.info('PassengerTier mutated', { passengerTierId, action, createdBy });
}

function insertPassengerAudit({ passengerId, action, oldName, newName, oldTierId, newTierId, createdBy }) {
  db.prepare(
    `INSERT INTO PassengerAudit
      (PassengerID, Action, Old_PassengerName, New_PassengerName, Old_PassengerTierID, New_PassengerTierID, CreatedBy)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(passengerId, action, oldName ?? null, newName ?? null, oldTierId ?? null, newTierId ?? null, createdBy);
  logger.info('Passenger mutated', { passengerId, action, createdBy });
}

function insertResourceAudit({ resourceId, action, oldName, newName, oldTierIds, newTierIds, createdBy }) {
  db.prepare(
    `INSERT INTO ResourceAudit
      (ResourceID, Action, Old_ResourceName, New_ResourceName, Old_PassengerTierIDs, New_PassengerTierIDs, CreatedBy)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    resourceId,
    action,
    oldName ?? null,
    newName ?? null,
    oldTierIds ? JSON.stringify(oldTierIds) : null,
    newTierIds ? JSON.stringify(newTierIds) : null,
    createdBy
  );
  logger.info('Resource mutated', { resourceId, action, createdBy });
}

module.exports = {
  crewLeadIdentity,
  passengerIdentity,
  insertPassengerTierAudit,
  insertPassengerAudit,
  insertResourceAudit,
};
