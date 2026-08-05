const fs = require('fs');
const path = require('path');
const db = require('./db');
const logger = require('./logger');

const dir = path.join(__dirname, 'migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

for (const file of files) {
  const sql = fs.readFileSync(path.join(dir, file), 'utf8');
  console.log(`Applying migration ${file}...`);
  db.exec(sql);
  logger.info('Migration applied', { file });
}

console.log('Migrations complete.');
