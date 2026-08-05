# Generated UI Prompts — Passenger Resource Management

Each prompt below builds one screen using the design system established in the
"Resources" artifact (marine-teal kiosk theme, condensed display type, tier-colored
cards/rows). Hand any single prompt to Claude Code to generate that screen consistently
with the others. All prompts were cross-checked against `projectspec.md`.

---

## ⚠ Cross-check notes (read before building)

- **Session countdown — resolved**: the Resources artifact originally showed an
  always-visible `mm:ss` countdown chip, which didn't match `projectspec.md` (Security,
  line 113): *show nothing for the first 50 seconds of inactivity; only in the last 10
  seconds, show a prompt with a countdown, a "Resume session" button, and a "Log out"
  button.* The artifact has since been updated to the spec-correct behavior (silent
  topbar "Log out" button + a `--crit`-styled modal with ring countdown that appears only
  in the final 10 seconds). Prompt 2 below documents that same behavior for the real
  React implementation — treat the artifact as the reference build, not just the spec text.
- **Access code masking**: spec requires the access code to always render masked (UX only,
  never the real value) on every login-adjacent screen. Called out explicitly in Prompt 1.
- **Tier colors**: Silver `#7c8894` / Gold `#ac8a1f` / Platinum `#78699e` (light theme),
  with soft-tint backgrounds and dark-theme equivalents already defined as CSS custom
  properties (`--tier-silver`, `--tier-gold`, `--tier-platinum`, and `-soft` variants) —
  reuse these tokens rather than inventing new tier colors per screen.
- **CreatedBy / UpdatedBy formatting**: any screen displaying `PassengerResourceUsage` rows
  (Usage Reports, Resource lock/unlock panel) must render these as `Passenger_<id>` or
  `CrewLead_<id>`, matching the spec's exact format — do not paraphrase as "Passenger" or
  "Staff."

---

## Design system reference (paste into every prompt's context)

```
Shell: fixed left nav (15rem) + main content area, collapses to top-only nav under 760px.
Type: display = "Bahnschrift, Haettenschweiler, Arial Narrow" condensed sans (headings,
  nav brand); body = system sans stack; data/codes/timestamps = ui-monospace with
  font-variant-numeric: tabular-nums.
Palette (light): ink #182220, ink-soft #55625d, ground #eef1ee, panel #ffffff,
  accent (marine teal) #2f6f6a, brass #b08a4e.
Status colors (semantic, separate from tier colors): ok #3f7d4a, warn #b0781f,
  crit #a4402f — each with a matching -soft background for pill/chip fills.
Tier colors: silver #7c8894, gold #ac8a1f, platinum #78699e — each with a -soft tint.
  Full 2px colored border + soft tinted background on cards; colored left-border accent
  + soft tinted row background in tables. Tier chips are outlined pills on --panel
  background so they stand out against the tinted card/row.
Components: rounded 12px cards/panels with subtle shadow (--shadow token), 999px pill
  buttons/chips, status pills combine an icon dot + label (never color alone).
Both light and dark themes are token-driven via :root, prefers-color-scheme, and
  :root[data-theme] overrides — every new screen must support both.
```

---

## Passenger-facing screens

### Prompt 1 — Login Page (shared by Passenger and Crew Lead)

> Build a Login screen for the Passenger Resource Management kiosk, reusing the
> established design system (marine-teal palette, condensed display type, both themes).
> The device is shared and login happens by scanning a physical access card into a reader
> that auto-fills the access code field — there is no manual password entry flow to design
> around. Requirements from spec:
> - A field shows the scanned access code for UX confirmation only, always **masked**
>   (e.g. dots or asterisks) — never render the real value in the DOM as plain text state
>   that could be read from devtools trivially; treat it as write-only feedback.
> - Include a brief, visible warning that this is a shared device and the user must log
>   out immediately after use — misuse while unattended is the user's responsibility.
> - Passenger and Crew Lead use **separate login pages/routes**, but they should look
>   visually identical (same shell, same card, same copy tone) — differentiate only by
>   which access-code table the scan validates against.
> - No visible "Login" button is required if the flow is card-scan-driven, but include a
>   subtle "Waiting for card scan…" state indicator (e.g. a pulsing reader icon) so the
>   kiosk doesn't look frozen.
> - On successful scan, redirect into the Passenger or Crew Lead shell respectively.

### Prompt 2 — Session Handling (inactivity countdown)

> Implement the session-expiry behavior specified in `projectspec.md` exactly — this
> supersedes the always-visible countdown chip in the earlier Resources mockup:
> - Session expires after 60 seconds of inactivity, or on explicit logout.
> - For the **first 50 seconds** of inactivity, show nothing — no visible timer.
> - In the **last 10 seconds**, surface a modal/prompt (not a silent toast) containing:
>   a live countdown, a "Resume session" button, and a "Log out" button.
> - If the countdown reaches zero without resume, expire the session on both client and
>   server; the client must auto-redirect to the appropriate Login page (Passenger vs.
>   Crew Lead).
> - Style the modal using the existing `--crit` status token once inside the final 10
>   seconds (matching the banking-style urgency cue), on a scrim over the current screen.

### Prompt 3 — Passenger Profile Page

> Build the read-only Profile page for a logged-in Passenger, in the existing shell (left
> nav with Profile / Resources / History, same as the Resources screen already built).
> Data comes from the `Passenger` table filtered to the logged-in `PassengerID`:
> `PassengerName` and current `PassengerTierID` (resolved to its tier name — Silver /
> Gold / Platinum — rendered as the same tier chip component used on Resources/History).
> This page is strictly **read-only** — spec confirms a Passenger has no direct way to
> update any table — so do not include edit affordances, even disabled ones.

### Prompt 4 — Passenger History Page

> Build the read-only History page for a logged-in Passenger, reusing the "Recent
> history" table component already built on the Resources screen (tier-tinted rows, tier
> chip next to resource name, mono timestamps and duration).
> Data: `PassengerResourceUsage` rows filtered to the logged-in `PassengerID`. Per spec,
> **exclude any resource currently in-use** (rows where `ResourceUsageEndDT` is still
> null) — this page shows completed sessions only; the in-progress one still appears on
> the Resources page's own card, not here.

---

## Crew Lead (Admin) screens

### Prompt 5 — Crew Lead Shell + Login

> Build the Crew Lead login page (Prompt 1's sibling route) and the Crew Lead app shell:
> left nav sections for Usage Reports, Passengers, Resources, Passenger Tiers, and Audit
> Logs. Visually identical component language to the Passenger shell (same nav pattern,
> same brand mark treatment) — swap the nav items and the identity chip to show the
> Crew Lead's name and `CrewLead_<id>`.

### Prompt 6 — Usage Reports (View by Passenger / View by Resource)

> Build a Usage Reports page with two views, tab-switchable: **By Passenger** and **By
> Resource**. Both load from `PassengerResourceUsage`:
> - By Passenger: rows aggregated by `PassengerID`, showing summed
>   `ResourceUsageTotalDuration`.
> - By Resource: rows aggregated by `ResourceID`, same aggregation on duration.
> - Both views are **filterable by a `ResourceUsageStartDT` date range** — include a date
>   range control in the panel header, styled consistently with the existing filter/action
>   row pattern.
> - Unlike the Passenger History page, these reports **include resources currently
>   in-use** — render those rows with a distinct status pill labeled exactly **"In-Use"**
>   using the `--warn` token (matching the in-use status pill already established on the
>   Resources cards), rather than folding them into the completed-duration sum.
> - Use tabular-nums for all duration/aggregate columns; keep the tier-tint row treatment
>   only if a tier column is present (aggregation by passenger/resource doesn't
>   necessarily need it — omit if it clutters the aggregate view).

### Prompt 7 — Passenger List + View/Edit/Delete

> Build the Passenger List page (data: `Passenger` table, excluding soft-deleted rows —
> spec: soft-deleted records must not be visible in standard list UI). Table columns:
> `PassengerName`, current tier (as a tier chip), and row actions (View, Edit, Delete).
> - Delete is a **soft delete** (`IsDeleted = true`), not a destructive removal — label the
>   action "Delete" but confirm via a dialog that clarifies it's reversible/archival, not
>   permanent erasure.
> - **Block deletion** (disable the action or show a blocking error) if the passenger is
>   currently using a resource (has an open `PassengerResourceUsage` row) — surface why
>   it's blocked, not just a disabled button with no explanation.
> - Every Create/Update/Delete here must write a row to `PassengerAudit` — this is a
>   backend requirement, but the UI's edit/delete confirmations should read as if the
>   action is being recorded (e.g. "This change will be logged").

### Prompt 8 — Create / Edit Passenger form

> Build a Create/Edit Passenger form (shared component, "Create" and "Edit" modes) with
> fields: `PassengerName` (text) and `PassengerTierID` (select, populated from
> non-deleted `PassengerTier` rows, rendered with the tier chip inline in the option list).
> `PassengerAccessCode` is **not** a form field — access codes come only from the physical
> card and are not something a Crew Lead types in — omit it entirely from this form
> unless the spec later says otherwise.

### Prompt 9 — Resource List + View/Edit/Delete + Lock/Unlock

> Build the Resource List page (data: `Resource` table, non-deleted only). Columns:
> `ResourceName`, allowed tiers (multiple tier chips, since `PassengerTierIDs` is a JSON
> array), current status (Available / In-Use, same pill component as the Passenger
> Resources page), row actions (View, Edit, Delete).
> - On the **View Resource** detail panel, include a **Lock / Unlock hardware** button —
>   this is the one place a Crew Lead directly actuates hardware. Behavior per spec:
>   - **Unlock**: requires entering/searching for a `PassengerID` (searchable by
>     `PassengerName` — build this as a type-ahead search field, not a raw ID input).
>     On confirm, this creates a `PassengerResourceUsage` row with `CreatedBy =
>     CrewLead_<id>` (the acting Crew Lead's own ID, not a hardcoded placeholder).
>   - **Lock**: updates the open `PassengerResourceUsage` row's `ResourceUsageEndDT` =
>     now and `UpdatedBy = CrewLead_<id>`.
>   - Note a passenger can unlock a device that a Crew Lead later locks, and vice versa —
>     the UI shouldn't assume symmetry; show whoever actually created vs. updated the
>     usage row, using the `Passenger_<id>` / `CrewLead_<id>` values as-is.
> - **Block deletion** if the resource is currently in-use (open usage row), same pattern
>   as Prompt 7 — explain why, don't just disable silently.

### Prompt 10 — Create / Edit Resource form

> Build a Create/Edit Resource form with fields: `ResourceName` (text) and
> `PassengerTierIDs` (multi-select of non-deleted Passenger Tiers, rendered as removable
> tier chips as they're selected — reuse the chip component, not a generic multi-select
> listbox, so the tier colors stay visible while composing the resource's access list).

### Prompt 11 — Passenger Tier List + Create/Edit/Delete

> Build the Passenger Tier List page (data: `PassengerTier`, non-deleted only). Since
> there are exactly three tiers today (Silver, Gold, Platinum), keep the list simple —
> name + delete/edit actions, each row prefixed with its tier color swatch.
> - **Block deletion** if the tier is still referenced by any `Passenger.PassengerTierID`
>   or appears in any `Resource.PassengerTierIDs` array — surface which
>   passengers/resources are blocking it if feasible, otherwise a clear generic reason.
> - Create/Edit form: single `PassengerTierName` field. Note new tier names won't
>   automatically have a color token — flag in the UI copy (or dev note) that adding a
>   4th tier requires extending the `--tier-*` token set; don't let the form silently
>   accept a tier with no visual treatment.

### Prompt 12 — Audit Log pages (Passenger / Resource / Passenger Tier)

> Build three Audit Log pages — Passenger Audit, Resource Audit, Passenger Tier Audit —
> sharing one table layout. Columns: `Action` (Create/Update/Delete, as a small status-
> style pill — pick neutral/semantic colors distinct from both the tier and Available/
> In-Use palettes so audit actions aren't visually confused with resource status),
> Old/New value columns (side-by-side, e.g. "Old: Silver → New: Gold" for tier changes;
> for `ResourceAudit`'s `Old/New_PassengerTierIDs`, render both as tier-chip lists rather
> than raw JSON), `CreatedOn` (mono timestamp), `CreatedBy`.
> - Per spec, `CreatedBy` on all three audit tables is always a Crew Lead identity
>   (`CrewLead_<id>`) — Passengers never appear as the actor here, since they have no
>   direct update path. Don't build a Passenger-actor case into the UI.
> - These are report-style pages: include the same table pattern as Usage Reports, but no
>   aggregation — one row per audit event, most recent first.
> - Unlike the standard list pages, audit pages **do show soft-deleted entities' history**
>   (a deleted Passenger's audit trail still needs to be visible here) — don't apply the
>   "hide soft-deleted" filter that Prompts 7/9/11 use.

---

## Suggested build order

1. Prompt 1, 5 (both login pages + shells)
2. Prompt 2 (session countdown — artifact reference already built; port that same
   silent-then-modal behavior into the real login/session flow)
3. Prompt 3, 4 (finish the Passenger side)
4. Prompt 7–11 (Crew Lead CRUD screens)
5. Prompt 6, 12 (reporting/audit screens — depend on the above existing so there's real
   data shape to visualize against)
