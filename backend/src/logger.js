const fs = require('fs');
const path = require('path');

// Plain-text, one-file-per-day logger written to backend/logs/, alongside src/.
// Per projectspec.md's "Extra Instructions": logs must be local text files, not an
// external log service, so this app can be debugged after the fact with no extra tooling.

const LOG_DIR = path.join(__dirname, '..', 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });

function currentLogFile() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(LOG_DIR, `${today}.log`);
}

function write(level, message, meta) {
  const line = `[${new Date().toISOString()}] [${level}] ${message}${
    meta !== undefined ? ' ' + JSON.stringify(meta) : ''
  }\n`;
  fs.appendFileSync(currentLogFile(), line);
  if (level === 'ERROR') console.error(line.trim());
}

module.exports = {
  info: (message, meta) => write('INFO', message, meta),
  warn: (message, meta) => write('WARN', message, meta),
  error: (message, meta) => write('ERROR', message, meta),
};
