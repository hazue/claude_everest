import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { apiFetch } from '../../api.js';

export default function TierForm() {
  const { logout } = useOutletContext();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isEdit) {
      apiFetch(`/crewlead/tiers/${id}`).then((t) => setName(t.PassengerTierName)).catch((e) => setError(e.message));
    }
  }, [id, isEdit]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isEdit) {
        await apiFetch(`/crewlead/tiers/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
      } else {
        await apiFetch('/crewlead/tiers', { method: 'POST', body: JSON.stringify({ name }) });
      }
      navigate('/crewlead/tiers');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="pagehead">
          <h1 className="display">{isEdit ? 'Edit Tier' : 'Create Tier'}</h1>
          <p>This change will be recorded in the Passenger Tier audit log.</p>
        </div>
        <button className="logout-btn" onClick={logout}>Log out</button>
      </div>

      <form className="form-grid" onSubmit={submit}>
        <div className="field">
          <label htmlFor="tierName">Tier name</label>
          <input id="tierName" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        {error && <p className="error-text">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={() => navigate('/crewlead/tiers')}>Cancel</button>
          <button type="submit" className="btn primary" disabled={busy || !name}>
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create tier'}
          </button>
        </div>
      </form>
    </>
  );
}
