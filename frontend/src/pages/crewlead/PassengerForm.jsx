import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { apiFetch } from '../../api.js';
import TierChip from '../../components/TierChip.jsx';

export default function PassengerForm() {
  const { logout } = useOutletContext();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [tiers, setTiers] = useState([]);
  const [name, setName] = useState('');
  const [tierId, setTierId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiFetch('/crewlead/tiers').then(setTiers).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (isEdit) {
      apiFetch(`/crewlead/passengers/${id}`).then((p) => {
        setName(p.PassengerName);
        setTierId(String(p.PassengerTierID));
      }).catch((e) => setError(e.message));
    }
  }, [id, isEdit]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isEdit) {
        await apiFetch(`/crewlead/passengers/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ name, tierId: Number(tierId) }),
        });
      } else {
        await apiFetch('/crewlead/passengers', {
          method: 'POST',
          body: JSON.stringify({ name, tierId: Number(tierId), accessCode }),
        });
      }
      navigate('/crewlead/passengers');
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
          <h1 className="display">{isEdit ? 'Edit Passenger' : 'Create Passenger'}</h1>
          <p>This change will be recorded in the Passenger audit log.</p>
        </div>
        <button className="logout-btn" onClick={logout}>Log out</button>
      </div>

      <form className="form-grid" onSubmit={submit}>
        <div className="field">
          <label htmlFor="passengerName">Name</label>
          <input id="passengerName" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="passengerTier">Tier</label>
          <select id="passengerTier" value={tierId} onChange={(e) => setTierId(e.target.value)} required>
            <option value="" disabled>Select a tier…</option>
            {tiers.map((t) => (
              <option key={t.PassengerTierID} value={t.PassengerTierID}>{t.PassengerTierName}</option>
            ))}
          </select>
          {tierId && (
            <div style={{ marginTop: '0.3rem' }}>
              <TierChip name={tiers.find((t) => String(t.PassengerTierID) === tierId)?.PassengerTierName} />
            </div>
          )}
        </div>

        {!isEdit && (
          <div className="field">
            <label htmlFor="accessCode">New access card code</label>
            <input
              id="accessCode"
              type="password"
              autoComplete="off"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Scan the new card, or type its code"
              required
            />
            <p className="hint">
              Set once at onboarding — there's no rotation mechanism, so a lost card means issuing a new
              Passenger record rather than resetting this one.
            </p>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={() => navigate('/crewlead/passengers')}>Cancel</button>
          <button type="submit" className="btn primary" disabled={busy || !name || !tierId || (!isEdit && !accessCode)}>
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create passenger'}
          </button>
        </div>
      </form>
    </>
  );
}
