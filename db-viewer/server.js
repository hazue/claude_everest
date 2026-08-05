const path = require('path');
const express = require('express');
const { DatabaseSync } = require('node:sqlite');

// Points at the Passenger Resource Management backend's DB by default.
// Override with: DB_FILE=/path/to/other.db npm start
const dbFile = process.env.DB_FILE || path.join(__dirname, '..', 'backend', 'data', 'app.db');
const db = new DatabaseSync(dbFile, { readOnly: false });

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/db-file', (req, res) => res.json({ dbFile }));

app.get('/api/tables', (req, res) => {
  try {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .all()
      .map((r) => r.name);
    res.json({ tables });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function tableExists(name) {
  return !!db
    .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name = ?")
    .get(name);
}

app.get('/api/tables/:name', (req, res) => {
  if (!tableExists(req.params.name)) return res.status(404).json({ error: 'No such table' });
  try {
    const rows = db.prepare(`SELECT * FROM "${req.params.name}" LIMIT 500`).all();
    res.json({ rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Column metadata, used by the client to render an insert form per table.
app.get('/api/tables/:name/schema', (req, res) => {
  if (!tableExists(req.params.name)) return res.status(404).json({ error: 'No such table' });
  try {
    const columns = db.prepare(`PRAGMA table_info("${req.params.name}")`).all();
    res.json({
      columns: columns.map((c) => ({
        name: c.name,
        type: c.type,
        notNull: !!c.notnull,
        defaultValue: c.dflt_value,
        primaryKey: !!c.pk,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inserts a single row. Body: { values: { ColumnName: value, ... } }.
// Columns omitted from `values` are left out of the INSERT so DEFAULTs/AUTOINCREMENT apply.
app.post('/api/tables/:name/rows', (req, res) => {
  if (!tableExists(req.params.name)) return res.status(404).json({ error: 'No such table' });
  const { values } = req.body || {};
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    return res.status(400).json({ error: 'values object is required' });
  }

  try {
    const columns = db.prepare(`PRAGMA table_info("${req.params.name}")`).all().map((c) => c.name);
    const entries = Object.entries(values).filter(([col, val]) => {
      if (!columns.includes(col)) throw new Error(`Unknown column: ${col}`);
      return val !== '' && val !== null && val !== undefined;
    });

    if (entries.length === 0) {
      return res.status(400).json({ error: 'At least one column value is required' });
    }

    const colNames = entries.map(([col]) => `"${col}"`).join(', ');
    const placeholders = entries.map(() => '?').join(', ');
    const params = entries.map(([, val]) => val);

    const info = db
      .prepare(`INSERT INTO "${req.params.name}" (${colNames}) VALUES (${placeholders})`)
      .run(...params);
    res.status(201).json({ changes: info.changes, lastInsertRowid: info.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Runs arbitrary SQL: SELECTs return rows, everything else returns changes/lastInsertRowid.
app.post('/api/query', (req, res) => {
  const { sql } = req.body || {};
  if (!sql || !sql.trim()) return res.status(400).json({ error: 'sql is required' });

  try {
    const isSelect = /^\s*(select|pragma|explain)/i.test(sql);
    const stmt = db.prepare(sql);
    if (isSelect) {
      res.json({ rows: stmt.all() });
    } else {
      const info = stmt.run();
      res.json({ changes: info.changes, lastInsertRowid: info.lastInsertRowid });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const port = process.env.PORT || 4100;
app.listen(port, () => {
  console.log(`SQLite DB viewer listening on :${port}`);
  console.log(`Viewing: ${dbFile}`);
});
