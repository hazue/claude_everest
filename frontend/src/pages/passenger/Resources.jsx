import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiFetch } from '../../api.js';
import TierChip, { tierClass, mostExclusiveTier } from '../../components/TierChip.jsx';
import StatusPill from '../../components/StatusPill.jsx';

function formatElapsed(startIso) {
  const started = new Date(startIso.replace(' ', 'T') + 'Z');
  const seconds = Math.max(0, Math.floor((Date.now() - started.getTime()) / 1000));
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function Resources() {
  const { logout } = useOutletContext();
  const [resources, setResources] = useState(null);
  const [error, setError] = useState('');
  const [, forceTick] = useState(0);

  useEffect(() => {
    apiFetch('/passenger/resources').then(setResources).catch((e) => setError(e.message));
  }, []);

  // Re-render every second so "running" durations on cards the passenger currently
  // holds keep advancing without a full re-fetch.
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="pagehead">
          <h1 className="display">Resources</h1>
          <p>Available for your tier — this list is read-only; scan your card at any reader to unlock.</p>
        </div>
        <button className="logout-btn" onClick={logout}>Log out</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {resources && resources.length === 0 && (
        <div className="empty-state">No resources are available for your current tier.</div>
      )}

      {resources && resources.length > 0 && (
        <section className="grid">
          {resources.map((r) => {
            const cardTier = tierClass(mostExclusiveTier(r.PassengerTierNames));
            return (
              <article key={r.ResourceID} className={`rcard${cardTier ? ` tier-${cardTier}` : ''}`}>
                <div className="rcard-head">
                  <div>
                    <div className="rcard-name">{r.ResourceName}</div>
                    <div className="rcard-id mono">Resource_{String(r.ResourceID).padStart(4, '0')}</div>
                  </div>
                  {r.status === 'available' && <StatusPill variant="available">Available</StatusPill>}
                  {r.status === 'in-use' && <StatusPill variant="in-use">In use</StatusPill>}
                  {r.status === 'locked-you' && <StatusPill variant="locked-you">In use by you</StatusPill>}
                </div>
                <div className="tier-chips">
                  {r.PassengerTierNames.map((name) => (
                    <TierChip key={name} name={name} />
                  ))}
                </div>
                {r.status === 'locked-you' && (
                  <div className="rcard-meta">
                    Unlocked <span className="mono">{r.usageStartedAt?.slice(11, 16)}</span> · running{' '}
                    <span className="mono">{formatElapsed(r.usageStartedAt)}</span>
                  </div>
                )}
                <button className="rcard-action disabled" disabled>
                  {r.status === 'available' && 'Scan card at reader to unlock'}
                  {r.status === 'in-use' && 'Currently unavailable'}
                  {r.status === 'locked-you' && 'Scan card at reader to return'}
                </button>
              </article>
            );
          })}
        </section>
      )}

      <footer className="note">
        Resources unlock and lock at the physical card reader — this page only reflects status.
      </footer>
    </>
  );
}
