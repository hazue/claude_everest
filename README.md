# Passenger Resource Management

Stack (per the "Tech Stack" section of `projectspec.md`): React frontend (Vite), Node.js/Express backend,
SQLite database. The backend uses the built-in `node:sqlite` module rather than `better-sqlite3`, since
this avoids requiring native build tools (Visual Studio C++) to install — it runs anywhere Node 22.5+ is
installed, with zero external services to stand up.

Generated from the prompts in `prompts.md`, based on `projectspec.md`.

## Run it

```
cd backend
npm install
npm run migrate   # applies src/migrations/*.sql
npm run seed      # seeds from ../sampledata.sql (3 CrewLeads, 3 PassengerTiers, 9 Passengers, 7 Resources)
npm run dev       # starts the API on :4000
npm test          # runs unit tests (session expiry, access-code hashing, logger)
```

```
cd frontend
npm install
npm run dev       # starts on :5173, proxies /api/* to http://localhost:4000
```

Open `http://localhost:5173` in a browser.

Seeded raw access codes (for local testing only — DB stores bcrypt hashes, never the plaintext):
- Crew Leads: `crewlead_a`, `crewlead_b`, `crewlead_c`
- Passengers: `passenger_a` .. `passenger_i`

## Structure

- `backend/src/logger.js` — plain-text, one-file-per-day logger writing to `backend/logs/` (gitignored),
  per the "Extra Instructions" section of `projectspec.md`. Used by every route/middleware.
- `backend/src/migrations/001_init.sql` — full schema (CrewLead, PassengerTier, Passenger, Resource,
  PassengerResourceUsage, and the three audit tables), matching `projectspec.md` exactly.
- `backend/src/seed.js` — seeds by executing `sampledata.sql` (repo root) directly against the DB.
- `backend/src/lib/sessionStore.js` — in-memory session store with a 60-second inactivity timeout.
- `backend/src/routes/auth.js` — separate Passenger/CrewLead login endpoints, logout, and a heartbeat
  endpoint the client polls for the countdown timer (polling itself does not reset the inactivity clock).
- `backend/src/routes/passenger.js` — read-only Profile/Resources/History endpoints.
- `backend/src/routes/crewlead.js` — full CRUD for PassengerTier/Passenger/Resource (soft delete only,
  with delete-blocking rules from the spec), manual lock/unlock, usage reports, and audit report views.
- `backend/src/routes/hardware.js` — the 3 hardware-only endpoints (validate tier, start usage, end usage).
  Per the spec, MAC-address filtering is enforced by the router/network layer, not this application.
- `frontend/src/pages/*.jsx` — Passenger login/dashboard and Crew Lead login/dashboard React pages.

## Hardware endpoints

`POST /api/hardware/validate-tier`, `POST /api/hardware/usage/start`, `POST /api/hardware/usage/end`.
These bypass normal session auth (hardware doesn't log in) and are intended to be reachable only from
the trusted intranet segment that the router's MAC allowlist restricts.
