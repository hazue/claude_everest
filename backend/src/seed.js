const fs = require('fs');
const path = require('path');
const db = require('./db');
const logger = require('./logger');

// Seed data comes directly from the two SQL files at the repo root rather than being
// generated here: sampledata.sql (CrewLead/PassengerTier/Passenger/Resource) and
// passengerresourceusage_sample.sql (a realistic PassengerResourceUsage history,
// including two open/in-use rows), so History, Usage Reports, and resource status
// all have real content to render instead of empty states.
const repoRoot = path.join(__dirname, '..', '..');
const files = ['sampledata.sql', 'passengerresourceusage_sample.sql'];

for (const file of files) {
  const sql = fs.readFileSync(path.join(repoRoot, file), 'utf8');
  db.exec(sql);
  logger.info('Database seeded', { file });
  console.log(`Seeded from ${file}.`);
}

console.log('Seed complete.');
console.log('Crew lead access codes: crewlead_a, crewlead_b, crewlead_c');
console.log('Passenger access codes: passenger_a .. passenger_i');
