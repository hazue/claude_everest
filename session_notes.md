# Session Notes — Passenger Resource Management

## Files
- `projectspec.md` — project specification (RDBMS design, UI, security, audit rules)
- `generated_prompts.md` — sequential implementation prompts for Claude Code, renamed from `prompts.md`

## Decisions made this session
1. **Hardware ResourceID binding**: Each hardware unit is hardcoded with the ResourceID of the Resource it controls, and includes that ResourceID in its API calls to the "Validate Passenger Tier" endpoint. No MAC-address-to-ResourceID mapping needed at the app layer (per spec, router handles MAC whitelisting).
2. **CreatedBy / UpdatedBy semantics** (PassengerResourceUsage table): Values are NOT fixed literals like `Passenger_001`. They must be `Passenger_<PassengerID>` or `CrewLead_<CrewLeadID>`, identifying the actual acting user (the real ID of whichever passenger or crew lead performed the unlock/lock action). Both `projectspec.md` and `generated_prompts.md` were updated to reflect this.

## Status
- Spec and prompts reviewed and reconciled; no implementation started yet.
- Next step: begin with Prompt 1 (project scaffolding) from `generated_prompts.md` when ready.
