import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiFetch } from '../../api.js';
import TierChip from '../../components/TierChip.jsx';

const ACTION_COLOR = { Create: 'available', Update: 'in-use', Delete: 'locked-you' };

function ActionPill({ action }) {
  return <span className={`status ${ACTION_COLOR[action] || ''}`}><span className="dot" />{action}</span>;
}

export default function AuditLog() {
  const { logout } = useOutletContext();
  const [entity, setEntity] = useState('passenger');
  const [rows, setRows] = useState(null);
  const [tierNameById, setTierNameById] = useState(new Map());
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/crewlead/tiers').then((tiers) => {
      setTierNameById(new Map(tiers.map((t) => [t.PassengerTierID, t.PassengerTierName])));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const endpoint = {
      passenger: '/crewlead/audits/passenger',
      resource: '/crewlead/audits/resource',
      tier: '/crewlead/audits/passenger-tier',
    }[entity];
    apiFetch(endpoint).then(setRows).catch((e) => setError(e.message));
  }, [entity]);

  function tierChips(idsJson) {
    if (!idsJson) return null;
    const ids = typeof idsJson === 'string' ? JSON.parse(idsJson) : idsJson;
    return (
      <div className="tier-chips">
        {ids.map((tid) => <TierChip key={tid} name={tierNameById.get(tid) || `Tier_${tid}`} />)}
      </div>
    );
  }

  return (
    <>
      <div className="topbar">
        <div className="pagehead">
          <h1 className="display">Audit Logs</h1>
          <p>Every Create, Update, and Delete — including soft-deleted records' history.</p>
        </div>
        <button className="logout-btn" onClick={logout}>Log out</button>
      </div>

      <div className="tabs">
        <button className={entity === 'passenger' ? 'active' : ''} onClick={() => setEntity('passenger')}>Passenger</button>
        <button className={entity === 'resource' ? 'active' : ''} onClick={() => setEntity('resource')}>Resource</button>
        <button className={entity === 'tier' ? 'active' : ''} onClick={() => setEntity('tier')}>Passenger Tier</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <section className="panel">
        <div className="panel-head">{entity === 'passenger' ? 'Passenger audit' : entity === 'resource' ? 'Resource audit' : 'Passenger Tier audit'}</div>
        {rows && rows.length === 0 && <div className="empty-state">No audit entries yet.</div>}
        {rows && rows.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Change</th>
                  <th>Created on</th>
                  <th>Created by</th>
                </tr>
              </thead>
              <tbody>
                {entity === 'passenger' && rows.map((r) => (
                  <tr key={r.PassengerAuditID}>
                    <td><ActionPill action={r.Action} /></td>
                    <td>
                      {r.Old_PassengerName || r.New_PassengerName ? (
                        <div>{r.Old_PassengerName ?? '—'} → {r.New_PassengerName ?? '—'}</div>
                      ) : null}
                      {(r.Old_PassengerTierID || r.New_PassengerTierID) && (
                        <div className="hint">
                          Tier: {tierNameById.get(r.Old_PassengerTierID) ?? '—'} → {tierNameById.get(r.New_PassengerTierID) ?? '—'}
                        </div>
                      )}
                    </td>
                    <td className="mono">{r.CreatedOn}</td>
                    <td className="mono">{r.CreatedBy}</td>
                  </tr>
                ))}

                {entity === 'resource' && rows.map((r) => (
                  <tr key={r.ResourceAuditID}>
                    <td><ActionPill action={r.Action} /></td>
                    <td>
                      {(r.Old_ResourceName || r.New_ResourceName) && (
                        <div>{r.Old_ResourceName ?? '—'} → {r.New_ResourceName ?? '—'}</div>
                      )}
                      {r.Old_PassengerTierIDs && (
                        <div className="hint">Old tiers: {tierChips(r.Old_PassengerTierIDs)}</div>
                      )}
                      {r.New_PassengerTierIDs && (
                        <div className="hint">New tiers: {tierChips(r.New_PassengerTierIDs)}</div>
                      )}
                    </td>
                    <td className="mono">{r.CreatedOn}</td>
                    <td className="mono">{r.CreatedBy}</td>
                  </tr>
                ))}

                {entity === 'tier' && rows.map((r) => (
                  <tr key={r.PassengerTierAuditID}>
                    <td><ActionPill action={r.Action} /></td>
                    <td>{r.Old_PassengerTierName ?? '—'} → {r.New_PassengerTierName ?? '—'}</td>
                    <td className="mono">{r.CreatedOn}</td>
                    <td className="mono">{r.CreatedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
