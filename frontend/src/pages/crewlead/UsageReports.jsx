import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiFetch } from '../../api.js';
import StatusPill from '../../components/StatusPill.jsx';

function formatDuration(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function UsageReports() {
  const { logout } = useOutletContext();
  const [view, setView] = useState('passenger');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const endpoint = view === 'passenger' ? '/crewlead/reports/by-passenger' : '/crewlead/reports/by-resource';
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString() ? `?${params}` : '';
    apiFetch(endpoint + qs).then(setRows).catch((e) => setError(e.message));
  }, [view, from, to]);

  return (
    <>
      <div className="topbar">
        <div className="pagehead">
          <h1 className="display">Usage Reports</h1>
          <p>Summed resource usage, aggregated by passenger or by resource.</p>
        </div>
        <button className="logout-btn" onClick={logout}>Log out</button>
      </div>

      <div className="tabs">
        <button className={view === 'passenger' ? 'active' : ''} onClick={() => setView('passenger')}>By Passenger</button>
        <button className={view === 'resource' ? 'active' : ''} onClick={() => setView('resource')}>By Resource</button>
      </div>

      <div className="filter-row">
        <label className="hint" htmlFor="from">From</label>
        <input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <label className="hint" htmlFor="to">To</label>
        <input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {error && <p className="error-text">{error}</p>}

      <section className="panel">
        <div className="panel-head">{view === 'passenger' ? 'Total usage by passenger' : 'Total usage by resource'}</div>
        {rows && rows.length === 0 && <div className="empty-state">No usage recorded in this range.</div>}
        {rows && rows.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{view === 'passenger' ? 'Passenger' : 'Resource'}</th>
                  <th>Total duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.PassengerID ?? r.ResourceID}>
                    <td>{view === 'passenger' ? r.PassengerName : r.ResourceName}</td>
                    <td className="dur mono">{formatDuration(r.TotalDurationSeconds)}</td>
                    <td>
                      {r.status === 'In-Use'
                        ? <StatusPill variant="in-use">In-Use</StatusPill>
                        : <StatusPill variant="available">Completed</StatusPill>}
                    </td>
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
