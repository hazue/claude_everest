import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { apiFetch } from '../../api.js';
import TierChip from '../../components/TierChip.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

export default function Passengers() {
  const { logout } = useOutletContext();
  const [passengers, setPassengers] = useState(null);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    apiFetch('/crewlead/passengers').then(setPassengers).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function confirmDelete() {
    setBusy(true);
    setDeleteError('');
    try {
      await apiFetch(`/crewlead/passengers/${pendingDelete.PassengerID}`, { method: 'DELETE' });
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
          <h1 className="display">Passengers</h1>
          <p>Every registered passenger and their current tier.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Link className="btn primary" to="/crewlead/passengers/new">Create passenger</Link>
          <button className="logout-btn" onClick={logout}>Log out</button>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <section className="panel">
        <div className="panel-head">Passengers</div>
        {passengers && passengers.length === 0 && <div className="empty-state">No passengers yet.</div>}
        {passengers && passengers.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Tier</th><th></th></tr></thead>
              <tbody>
                {passengers.map((p) => (
                  <tr key={p.PassengerID}>
                    <td>{p.PassengerName}</td>
                    <td><TierChip name={p.PassengerTierName} /></td>
                    <td>
                      <div className="row-actions">
                        <Link className="btn ghost small" to={`/crewlead/passengers/${p.PassengerID}/edit`}>Edit</Link>
                        <button className="btn danger small" onClick={() => setPendingDelete(p)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this passenger?"
        body={`"${pendingDelete?.PassengerName}" will be archived, not permanently erased — this change is logged.`}
        error={deleteError}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => { setPendingDelete(null); setDeleteError(''); }}
      />
    </>
  );
}
