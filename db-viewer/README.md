# SQLite DB Viewer

Small standalone tool to browse tables and run ad-hoc SQL against a `node:sqlite` database file —
built for inspecting `backend/data/app.db` from the Passenger Resource Management app, but works
against any SQLite file.

## Run it

```
cd db-viewer
npm install
npm start                 # defaults to ../backend/data/app.db, serves on :4100
```

Or point it at a different file:

```
DB_FILE=/path/to/other.db PORT=4200 npm start
```

Open `http://localhost:4100`. Click a table in the sidebar for a quick `SELECT * LIMIT 500`, or type
any SQL (SELECT, INSERT, UPDATE, DELETE, PRAGMA, ...) into the box and hit Run.

This is a local dev tool with no auth — it executes arbitrary SQL against the DB file, so don't expose
it beyond localhost.
