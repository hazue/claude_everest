import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { apiFetch } from '../../api.js';
import TierChip from '../../components/TierChip.jsx';
import StatusPill from '../../components/StatusPill.jsx';

export default function ResourceDetail() {
  const { logout } = useOutletContext();
  const { id } = useParams();

  const [resource, setResource] = useState(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [selectedPassenger, setSelectedPassenger] = useState(null);

  function load() {
    apiFetch(`/crewlead/resources/${id}`).then(setResource).catch((e) => setError(e.message));
  }
  useEffect(load, [id]);

  useEffect(() => {
    if (!query) { setMatches([]); return; }
    const t = setTimeout(() => {
      apiFetch(`/crewlead/passengers-search?q=${encodeURIComponent(query)}`).then(setMatches).catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  async function unlock() {
    if (!selectedPassenger) return;
    setBusy(true);
    setActionError('');
    try {
      await apiFetch(`/crewlead/resources/${id}/unlock`, {
        method: 'POST',
        body: JSON.stringify({ passengerId: selectedPassenger.PassengerID }),
      });
      setSelectedPassenger(null);
      setQuery('');
      load();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function lock() {
    setBusy(true);
    setActionError('');
    try {
      await apiFetch(`/crewlead/resources/${id}/lock`, { method: 'POST' });
      load();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="pagehead">
          <h1 className="display">{resource?.ResourceName || 'Resource'}</h1>
          <p className="mono">Resource_{String(id).padStart(4, '0')}</p>
        </div>
        <button className="logout-btn" onClick={logout}>Log out</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {resource && (
        <>
          <section className="panel" style={{ maxWidth: '32rem' }}>
            <div className="panel-head">
              Details
              <StatusPill variant={resource.inUse ? 'in-use' : 'available'}>
                {resource.inUse ? 'In use' : 'Available'}
              </StatusPill>
            </div>
            <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="field">
                <label>Accessible tiers</label>
                <div className="tier-chips">
                  {resource.PassengerTierNames.map((n) => <TierChip key={n} name={n} />)}
                </div>
              </div>

              {resource.inUse && (
                <div className="field">
                  <label>Currently held by</label>
                  <div>{resource.inUse.PassengerName} (Passenger_{resource.inUse.PassengerID})</div>
                  <div className="hint">
                    Unlocked at <span className="mono">{resource.inUse.ResourceUsageStartDT}</span> by{' '}
                    <span className="mono">{resource.inUse.CreatedBy}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="panel" style={{ maxWidth: '32rem' }}>
            <div className="panel-head">Hardware lock / unlock</div>
            <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {actionError && <p className="error-text">{actionError}</p>}

              {!resource.inUse && (
                <>
                  <div className="field">
                    <label htmlFor="passengerSearch">Unlock on behalf of</label>
                    <input
                      id="passengerSearch"
                      type="search"
                      placeholder="Search passenger by name…"
                      value={selectedPassenger ? selectedPassenger.PassengerName : query}
                      onChange={(e) => { setSelectedPassenger(null); setQuery(e.target.value); }}
                    />
                    {matches.length > 0 && !selectedPassenger && (
                      <div className="panel" style={{ marginTop: '0.3rem' }}>
                        {matches.map((m) => (
                          <button
                            key={m.PassengerID}
                            type="button"
                            className="navitem"
                            onClick={() => { setSelectedPassenger(m); setMatches([]); }}
                          >
                            {m.PassengerName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="btn primary" onClick={unlock} disabled={!selectedPassenger || busy}>
                    {busy ? 'Unlocking…' : 'Unlock resource'}
                  </button>
                </>
              )}

              {resource.inUse && (
                <button className="btn primary" onClick={lock} disabled={busy}>
                  {busy ? 'Locking…' : 'Lock resource'}
                </button>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}
