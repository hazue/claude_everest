import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { apiFetch } from '../../api.js';
import TierChip, { tierClass } from '../../components/TierChip.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

export default function Tiers() {
  const { logout } = useOutletContext();
  const [tiers, setTiers] = useState(null);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    apiFetch('/crewlead/tiers').then(setTiers).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function confirmDelete() {
    setBusy(true);
    setDeleteError('');
    try {
      await apiFetch(`/crewlead/tiers/${pendingDelete.PassengerTierID}`, { method: 'DELETE' });
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
          <h1 className="display">Passenger Tiers</h1>
          <p>Silver, Gold, and Platinum — determines which resources a passenger can access.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Link className="btn primary" to="/crewlead/tiers/new">Create tier</Link>
          <button className="logout-btn" onClick={logout}>Log out</button>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <section className="panel">
        <div className="panel-head">Tiers</div>
        {tiers && tiers.length === 0 && <div className="empty-state">No tiers yet.</div>}
        {tiers && tiers.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tier</th><th></th></tr></thead>
              <tbody>
                {tiers.map((t) => (
                  <tr key={t.PassengerTierID}>
                    <td>
                      <span className="tier-swatch" style={{ '--tier-color': `var(--tier-${tierClass(t.PassengerTierName)}, var(--line))` }} />
                      {' '}
                      <TierChip name={t.PassengerTierName} />
                    </td>
                    <td>
                      <div className="row-actions">
                        <Link className="btn ghost small" to={`/crewlead/tiers/${t.PassengerTierID}/edit`}>Edit</Link>
                        <button className="btn danger small" onClick={() => setPendingDelete(t)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="note">
        Adding a 4th tier needs a matching color token before it gets its own visual treatment.
      </footer>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this tier?"
        body={`"${pendingDelete?.PassengerTierName}" will be archived, not permanently erased — this change is logged.`}
        error={deleteError}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => { setPendingDelete(null); setDeleteError(''); }}
      />
    </>
  );
}
