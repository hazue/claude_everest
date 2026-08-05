-- PassengerResourceUsage Sample Data
-- Based on sampledata.sql
--
-- Passengers & Tiers:
--   P1  Albert Jones     Silver (TierID 1)
--   P2  Bernard Okafor   Silver (TierID 1)
--   P3  Clark Thornton   Silver (TierID 1)
--   P4  Daniel Welsh     Silver (TierID 1)
--   P5  Elly Nguyen      Gold   (TierID 2)
--   P6  Frank Yamada     Gold   (TierID 2)
--   P7  Gilbert Fernandez Gold  (TierID 2)
--   P8  Helena Kim       Platinum (TierID 3)
--   P9  Iona Osei        Platinum (TierID 3)
--
-- Resources & Access:
--   R1  Food Stations      [1,2,3]  — All tiers
--   R2  Sleeping Pods      [1,2,3]  — All tiers
--   R3  Basic Hygiene      [1,2,3]  — All tiers
--   R4  Private Cabins     [2,3]    — Gold + Platinum
--   R5  Adv. Medical Bay   [2,3]    — Gold + Platinum
--   R6  Luxury O2 Pods     [3]      — Platinum only
--   R7  VIP Rec Deck       [3]      — Platinum only
--
-- CrewLeads: CL1 = Alice Smith, CL2 = Ben Reyes, CL3 = Chloe Patel
--
-- Rows 1-25: Completed usage (ResourceUsageEndDT IS NOT NULL)
-- Rows 26-27: Open/In-Use (ResourceUsageEndDT IS NULL) — one per resource

-- ── Completed Records ─────────────────────────────────────────────────────────

-- 1. Albert (Silver) → Food Stations | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (1, 1, '2026-06-15 08:30:00', '2026-06-15 08:55:00', 1500, 'Passenger_001', 'Passenger_001');

-- 2. Bernard (Silver) → Sleeping Pods | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (2, 2, '2026-06-15 09:00:00', '2026-06-15 11:00:00', 7200, 'Passenger_002', 'Passenger_002');

-- 3. Clark (Silver) → Basic Hygiene | Crew Lead unlocked, Passenger locked
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (3, 3, '2026-06-16 07:45:00', '2026-06-16 08:05:00', 1200, 'CrewLead_001', 'Passenger_003');

-- 4. Daniel (Silver) → Food Stations | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (4, 1, '2026-06-16 12:00:00', '2026-06-16 12:30:00', 1800, 'Passenger_004', 'Passenger_004');

-- 5. Elly (Gold) → Private Cabins | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (5, 4, '2026-06-17 14:00:00', '2026-06-17 15:00:00', 3600, 'Passenger_005', 'Passenger_005');

-- 6. Frank (Gold) → Adv. Medical Bay | Crew Lead unlocked & locked
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (6, 5, '2026-06-17 10:30:00', '2026-06-17 11:15:00', 2700, 'CrewLead_002', 'CrewLead_002');

-- 7. Gilbert (Gold) → Food Stations | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (7, 1, '2026-06-18 08:00:00', '2026-06-18 08:35:00', 2100, 'Passenger_007', 'Passenger_007');

-- 8. Helena (Platinum) → Luxury O2 Pods | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (8, 6, '2026-06-18 15:00:00', '2026-06-18 16:00:00', 3600, 'Passenger_008', 'Passenger_008');

-- 9. Iona (Platinum) → VIP Rec Deck | Crew Lead unlocked & locked
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (9, 7, '2026-06-19 11:00:00', '2026-06-19 12:30:00', 5400, 'CrewLead_003', 'CrewLead_003');

-- 10. Albert (Silver) → Sleeping Pods | Crew Lead unlocked, Passenger locked
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (1, 2, '2026-06-20 22:00:00', '2026-06-21 02:00:00', 14400, 'CrewLead_001', 'Passenger_001');

-- 11. Elly (Gold) → Food Stations | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (5, 1, '2026-06-21 07:30:00', '2026-06-21 07:50:00', 1200, 'Passenger_005', 'Passenger_005');

-- 12. Helena (Platinum) → Private Cabins | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (8, 4, '2026-06-21 13:00:00', '2026-06-21 15:00:00', 7200, 'Passenger_008', 'Passenger_008');

-- 13. Frank (Gold) → Sleeping Pods | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (6, 2, '2026-06-22 20:00:00', '2026-06-22 23:00:00', 10800, 'Passenger_006', 'Passenger_006');

-- 14. Iona (Platinum) → Luxury O2 Pods | Passenger unlocked, Crew Lead locked
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (9, 6, '2026-06-22 16:00:00', '2026-06-22 17:15:00', 4500, 'Passenger_009', 'CrewLead_001');

-- 15. Bernard (Silver) → Basic Hygiene | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (2, 3, '2026-06-23 06:00:00', '2026-06-23 06:15:00', 900, 'Passenger_002', 'Passenger_002');

-- 16. Clark (Silver) → Food Stations | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (3, 1, '2026-06-23 12:30:00', '2026-06-23 13:10:00', 2400, 'Passenger_003', 'Passenger_003');

-- 17. Gilbert (Gold) → Adv. Medical Bay | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (7, 5, '2026-06-24 09:00:00', '2026-06-24 09:30:00', 1800, 'Passenger_007', 'Passenger_007');

-- 18. Helena (Platinum) → VIP Rec Deck | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (8, 7, '2026-06-24 17:00:00', '2026-06-24 18:20:00', 4800, 'Passenger_008', 'Passenger_008');

-- 19. Daniel (Silver) → Sleeping Pods | Crew Lead unlocked, Passenger locked
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (4, 2, '2026-06-25 23:00:00', '2026-06-26 04:00:00', 18000, 'CrewLead_002', 'Passenger_004');

-- 20. Elly (Gold) → Private Cabins | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (5, 4, '2026-06-26 10:00:00', '2026-06-26 11:30:00', 5400, 'Passenger_005', 'Passenger_005');

-- 21. Iona (Platinum) → VIP Rec Deck | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (9, 7, '2026-06-27 14:00:00', '2026-06-27 16:00:00', 7200, 'Passenger_009', 'Passenger_009');

-- 22. Frank (Gold) → Food Stations | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (6, 1, '2026-06-28 08:00:00', '2026-06-28 08:25:00', 1500, 'Passenger_006', 'Passenger_006');

-- 23. Gilbert (Gold) → Private Cabins | Crew Lead unlocked & locked
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (7, 4, '2026-06-28 15:00:00', '2026-06-28 16:00:00', 3600, 'CrewLead_003', 'CrewLead_003');

-- 24. Helena (Platinum) → Adv. Medical Bay | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (8, 5, '2026-06-29 11:00:00', '2026-06-29 11:45:00', 2700, 'Passenger_008', 'Passenger_008');

-- 25. Albert (Silver) → Basic Hygiene | Passenger scanned in & out
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, ResourceUsageEndDT, ResourceUsageTotalDuration, CreatedBy, UpdatedBy)
VALUES
  (1, 3, '2026-06-30 07:00:00', '2026-06-30 07:12:00', 720, 'Passenger_001', 'Passenger_001');

-- ── Open / In-Use Records (ResourceUsageEndDT IS NULL) ────────────────────────
-- Only one open row per ResourceID is allowed (enforced by partial unique index).

-- 26. Iona (Platinum) → Food Stations | Currently in use — Passenger scanned in
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, CreatedBy)
VALUES
  (9, 1, '2026-07-01 09:00:00', 'Passenger_009');

-- 27. Helena (Platinum) → Luxury O2 Pods | Currently in use — Crew Lead unlocked
INSERT INTO PassengerResourceUsage
  (PassengerID, ResourceID, ResourceUsageStartDT, CreatedBy)
VALUES
  (8, 6, '2026-07-01 10:30:00', 'CrewLead_002');
