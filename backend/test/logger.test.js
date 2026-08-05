const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const logger = require('../src/logger');

test('logger writes timestamped, leveled lines to a text file in backend/logs', () => {
  const marker = `test-marker-${Date.now()}`;
  logger.info(marker, { foo: 'bar' });

  const today = new Date().toISOString().slice(0, 10);
  const logFile = path.join(__dirname, '..', 'logs', `${today}.log`);
  assert.ok(fs.existsSync(logFile));

  const contents = fs.readFileSync(logFile, 'utf8');
  assert.ok(contents.includes(marker));
  assert.match(contents, /\[\d{4}-\d{2}-\d{2}T.*\] \[INFO\]/);
});
