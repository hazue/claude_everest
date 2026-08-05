# Passenger Resource Management

A full-stack kiosk system for managing shared onboard resources (kayaks, sleeping pods,
medical bays, etc.) gated by passenger tier. Passengers unlock/return resources at a
physical card reader; Crew Leads manage passengers, resources, tiers, and audit history
through a web console. Built to the spec in [`projectspec.md`](./projectspec.md).

| | |
|---|---|
| **Frontend** | React 18 + Vite, React Router |
| **Backend** | Node.js + Express |
| **Database** | SQLite via the built-in `node:sqlite` module (no native build tools required) |
| **Auth** | Access-card codes, bcrypt-hashed, session cookies with a 60s inactivity timeout |

## Quick start

**1. Backend**
```sh
cd backend
npm install
npm run migrate   # applies backend/src/migrations/*.sql
npm run seed      # seeds from sampledata.sql + passengerresourceusage_sample.sql
npm run dev        # API on http://localhost:4000
```

**2. Frontend** (in a separate terminal)
```sh
cd frontend
npm install
npm run dev        # UI on http://localhost:5173, proxies /api to :4000
```

**3.** Open **http://localhost:5173**.

**Run backend tests:**
```sh
cd backend && npm test
```

## Login credentials (seeded demo data)

Raw codes are shown here for local testing only — the database only ever stores a
one-way bcrypt hash, never the plaintext.

| Role | Codes |
|---|---|
| Crew Lead | `crewlead_a`, `crewlead_b`, `crewlead_c` |
| Passenger | `passenger_a` through `passenger_i` |

## Features

**Passenger** — Profile, Resources (tier-filtered, read-only), History (completed
sessions only)

**Crew Lead** — Passenger / Resource / Passenger Tier CRUD with soft-delete and
delete-blocking rules, manual resource lock/unlock on a passenger's behalf, Usage
Reports (by passenger / by resource, date-filterable), and Audit Logs (Passenger /
Resource / Passenger Tier, including soft-deleted history)

**Hardware** — 3 unauthenticated endpoints reachable only from the trusted intranet
segment (MAC filtering is enforced by the router, not the app): validate tier, start
usage, end usage

## Project structure

```
backend/
  src/
    db.js                  SQLite connection + transaction helper
    migrate.js / seed.js   schema migrations, demo data seeding
    logger.js              plain-text, one-file-per-day request/mutation log
    lib/
      accessCode.js        bcrypt hashing + lookup for access cards
      audit.js             writes to the 3 audit tables
      sessionStore.js       in-memory sessions, 60s inactivity timeout
    middleware/auth.js      session attach/require/role-check middleware
    routes/
      auth.js               login (Passenger + CrewLead), logout, heartbeat, touch
      passenger.js          read-only Profile / Resources / History
      crewlead.js           full CRUD, lock/unlock, reports, audit views
      hardware.js           the 3 card-reader-only endpoints
    migrations/001_init.sql full schema

frontend/
  src/
    styles/tokens.css       design tokens (colors, type, both themes) shared by every page
    components/             AppShell (nav), SessionGuard (idle modal), TierChip, StatusPill, ConfirmDialog
    pages/
      Login.jsx              shared Passenger/CrewLead login screen
      passenger/             Profile, Resources, History
      crewlead/               Passengers, Resources, Tiers, UsageReports, AuditLog (+ forms)
```

## Session security

Sessions expire after 60 seconds of inactivity. Per the spec, nothing is shown for the
first 50 seconds — only in the final 10 does a warning modal appear with a countdown,
"Resume session," and "Log out." The heartbeat poll that drives this countdown is
deliberately read-only server-side (`peekSession`); only genuine authenticated requests
(`requireSession`) reset the idle clock, so polling alone can never keep a session alive.

## Data files at the repo root

- `sampledata.sql` / `passengerresourceusage_sample.sql` — seed data loaded by `npm run seed`
- `newdummydata_20260806_0444.sql` — a full export of the live database at a point in
  time (all 8 tables, FK-ordered), usable as an alternate seed file
- `generated_prompts.md` — the UI build prompts the frontend was implemented from, cross-checked against `projectspec.md`
