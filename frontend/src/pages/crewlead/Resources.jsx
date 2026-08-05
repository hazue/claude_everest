import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { apiFetch } from '../../api.js';
import TierChip, { tierClass, mostExclusiveTier } from '../../components/TierChip.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

export default function Resources() {
  const { logout } = useOutletContext();
  const [resources, setResources] = useState(null);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    apiFetch('/crewlead/resources').then(setResources).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function confirmDelete() {
    setBusy(true);
    setDeleteError('');
    try {
      await apiFetch(`/crewlead/resources/${pendingDelete.ResourceID}`, { method: 'DELETE' });
      setPendingDelete(null);
      load();
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="pagehead">
          <h1 className="display">Resources</h1>
          <p>All ship resources and which tiers may access them.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Link className="btn primary" to="/crewlead/resources/new">Create resource</Link>
          <button className="logout-btn" onClick={logout}>Log out</button>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

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
                  <StatusPill variant={r.status === 'in-use' ? 'in-use' : 'available'}>
                    {r.status === 'in-use' ? 'In use' : 'Available'}
                  </StatusPill>
                </div>
                <div className="tier-chips">
                  {r.PassengerTierNames.map((name) => <TierChip key={name} name={name} />)}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <Link className="btn ghost small" style={{ flex: 1 }} to={`/crewlead/resources/${r.ResourceID}`}>View</Link>
                  <Link className="btn ghost small" style={{ flex: 1 }} to={`/crewlead/resources/${r.ResourceID}/edit`}>Edit</Link>
                  <button className="btn danger small" onClick={() => setPendingDelete(r)}>Delete</button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this resource?"
        body={`"${pendingDelete?.ResourceName}" will be archived, not permanently erased — this change is logged.`}
        error={deleteError}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => { setPendingDelete(null); setDeleteError(''); }}
      />
    </>
  );
}
