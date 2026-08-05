// Tier names are matched case-insensitively to a color token; a tier with no matching
// token (e.g. a 4th tier added later) intentionally falls back to a neutral outline
// rather than silently picking a color, so it's obvious the token set needs extending.
export function tierClass(tierName) {
  const key = String(tierName || '').toLowerCase();
  if (key === 'silver' || key === 'gold' || key === 'platinum') return key;
  return '';
}

const RANK = { silver: 0, gold: 1, platinum: 2 };

// Picks the most exclusive tier among a resource's allowed tiers, for the card/row
// accent color — the highest bar to clear is the most informative single color to show.
export function mostExclusiveTier(tierNames) {
  if (!tierNames || tierNames.length === 0) return null;
  return [...tierNames].sort((a, b) => (RANK[a.toLowerCase()] ?? -1) - (RANK[b.toLowerCase()] ?? -1)).pop();
}

export default function TierChip({ name, onRemove }) {
  const cls = tierClass(name);
  if (onRemove) {
    return (
      <span className={`tier-chip removable ${cls}`}>
        {name}
        <button type="button" onClick={onRemove} aria-label={`Remove ${name}`}>×</button>
      </span>
    );
  }
  return <span className={`tier-chip ${cls}`}>{name}</span>;
}
