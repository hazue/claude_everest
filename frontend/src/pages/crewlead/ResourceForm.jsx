import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { apiFetch } from '../../api.js';
import TierChip from '../../components/TierChip.jsx';

export default function ResourceForm() {
  const { logout } = useOutletContext();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [tiers, setTiers] = useState([]);
  const [name, setName] = useState('');
  const [tierIds, setTierIds] = useState([]);
  const [addTierId, setAddTierId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiFetch('/crewlead/tiers').then(setTiers).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (isEdit) {
      apiFetch(`/crewlead/resources/${id}`).then((r) => {
        setName(r.ResourceName);
        setTierIds(r.PassengerTierIDs);
      }).catch((e) => setError(e.message));
    }
  }, [id, isEdit]);

  function addTier() {
    if (!addTierId) return;
    const num = Number(addTierId);
    if (!tierIds.includes(num)) setTierIds([...tierIds, num]);
    setAddTierId('');
  }
  function removeTier(tid) {
    setTierIds(tierIds.filter((t) => t !== tid));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = JSON.stringify({ name, tierIds });
      if (isEdit) {
        await apiFetch(`/crewlead/resources/${id}`, { method: 'PUT', body });
      } else {
        await apiFetch('/crewlead/resources', { method: 'POST', body });
      }
      navigate('/crewlead/resources');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const availableToAdd = tiers.filter((t) => !tierIds.includes(t.PassengerTierID));
  const selectedTierNames = tierIds
    .map((tid) => tiers.find((t) => t.PassengerTierID === tid))
    .filter(Boolean);

  return (
    <>
      <div className="topbar">
        <div className="pagehead">
          <h1 className="display">{isEdit ? 'Edit Resource' : 'Create Resource'}</h1>
          <p>This change will be recorded in the Resource audit log.</p>
        </div>
        <button className="logout-btn" onClick={logout}>Log out</button>
      </div>

      <form className="form-grid" onSubmit={submit}>
        <div className="field">
          <label htmlFor="resourceName">Name</label>
          <input id="resourceName" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="field">
          <label>Accessible tiers</label>
          <div className="tier-chips">
            {selectedTierNames.length === 0 && <span className="hint">No tiers selected yet.</span>}
            {selectedTierNames.map((t) => (
              <TierChip key={t.PassengerTierID} name={t.PassengerTierName} onRemove={() => removeTier(t.PassengerTierID)} />
            ))}
          </div>
          {availableToAdd.length > 0 && (
            <div className="filter-row">
              <select value={addTierId} onChange={(e) => setAddTierId(e.target.value)}>
                <option value="" disabled>Add a tier…</option>
                {availableToAdd.map((t) => (
                  <option key={t.PassengerTierID} value={t.PassengerTierID}>{t.PassengerTierName}</option>
                ))}
              </select>
              <button type="button" className="btn ghost small" onClick={addTier} disabled={!addTierId}>Add</button>
            </div>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={() => navigate('/crewlead/resources')}>Cancel</button>
          <button type="submit" className="btn primary" disabled={busy || !name || tierIds.length === 0}>
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create resource'}
          </button>
        </div>
      </form>
    </>
  );
}
