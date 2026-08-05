-- Passenger Resource Management schema (SQLite)

CREATE TABLE IF NOT EXISTS CrewLead (
  CrewLeadID INTEGER PRIMARY KEY AUTOINCREMENT,
  CrewLeadAccessCode TEXT NOT NULL,   -- bcrypt hash, never reversible
  CrewLeadEmployeeID TEXT NOT NULL UNIQUE,
  CrewLeadName TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS PassengerTier (
  PassengerTierID INTEGER PRIMARY KEY AUTOINCREMENT,
  PassengerTierName TEXT NOT NULL,
  IsDeleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Passenger (
  PassengerID INTEGER PRIMARY KEY AUTOINCREMENT,
  PassengerAccessCode TEXT NOT NULL,  -- bcrypt hash, never reversible
  PassengerName TEXT NOT NULL,
  PassengerTierID INTEGER NOT NULL REFERENCES PassengerTier(PassengerTierID),
  IsDeleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Resource (
  ResourceID INTEGER PRIMARY KEY AUTOINCREMENT,
  ResourceName TEXT NOT NULL,
  PassengerTierIDs TEXT NOT NULL DEFAULT '[]', -- JSON array of PassengerTierID
  IsDeleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS PassengerResourceUsage (
  PassengerResourceUsageID INTEGER PRIMARY KEY AUTOINCREMENT,
  PassengerID INTEGER NOT NULL REFERENCES Passenger(PassengerID),
  ResourceID INTEGER NOT NULL REFERENCES Resource(ResourceID),
  ResourceUsageStartDT TEXT NOT NULL DEFAULT (datetime('now')),
  ResourceUsageEndDT TEXT,
  ResourceUsageTotalDuration INTEGER, -- seconds; EndDT - StartDT
  CreatedBy TEXT NOT NULL,   -- Passenger_001 or CrewLead_001/002/003
  UpdatedBy TEXT
);

CREATE INDEX IF NOT EXISTS idx_pru_passenger ON PassengerResourceUsage(PassengerID);
CREATE INDEX IF NOT EXISTS idx_pru_resource ON PassengerResourceUsage(ResourceID);
CREATE INDEX IF NOT EXISTS idx_pru_start ON PassengerResourceUsage(ResourceUsageStartDT);
-- Only one open (in-use) usage row per resource at a time
CREATE UNIQUE INDEX IF NOT EXISTS uq_pru_open_resource ON PassengerResourceUsage(ResourceID) WHERE ResourceUsageEndDT IS NULL;

CREATE TABLE IF NOT EXISTS PassengerTierAudit (
  PassengerTierAuditID INTEGER PRIMARY KEY AUTOINCREMENT,
  PassengerTierID INTEGER NOT NULL REFERENCES PassengerTier(PassengerTierID),
  Action TEXT NOT NULL CHECK (Action IN ('Create','Update','Delete')),
  Old_PassengerTierName TEXT,
  New_PassengerTierName TEXT,
  CreatedOn TEXT NOT NULL DEFAULT (datetime('now')),
  CreatedBy TEXT NOT NULL -- CrewLead_00X only
);

CREATE TABLE IF NOT EXISTS PassengerAudit (
  PassengerAuditID INTEGER PRIMARY KEY AUTOINCREMENT,
  PassengerID INTEGER NOT NULL REFERENCES Passenger(PassengerID),
  Action TEXT NOT NULL CHECK (Action IN ('Create','Update','Delete')),
  Old_PassengerName TEXT,
  New_PassengerName TEXT,
  Old_PassengerTierID INTEGER,
  New_PassengerTierID INTEGER,
  CreatedOn TEXT NOT NULL DEFAULT (datetime('now')),
  CreatedBy TEXT NOT NULL -- CrewLead_00X only
);

CREATE TABLE IF NOT EXISTS ResourceAudit (
  ResourceAuditID INTEGER PRIMARY KEY AUTOINCREMENT,
  ResourceID INTEGER NOT NULL REFERENCES Resource(ResourceID),
  Action TEXT NOT NULL CHECK (Action IN ('Create','Update','Delete')),
  Old_ResourceName TEXT,
  New_ResourceName TEXT,
  Old_PassengerTierIDs TEXT,
  New_PassengerTierIDs TEXT,
  CreatedOn TEXT NOT NULL DEFAULT (datetime('now')),
  CreatedBy TEXT NOT NULL -- CrewLead_00X only
);
