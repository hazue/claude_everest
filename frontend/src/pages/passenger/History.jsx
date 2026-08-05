import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiFetch } from '../../api.js';

function formatDuration(totalSeconds) {
  if (totalSeconds == null) return '—';
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function History() {
  const { logout } = useOutletContext();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/passenger/history').then(setRows).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="pagehead">
          <h1 className="display">History</h1>
          <p>Your completed resource sessions. Resources still in use don't appear here yet.</p>
        </div>
        <button className="logout-btn" onClick={logout}>Log out</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <section className="panel">
        <div className="panel-head">Usage history</div>
        {rows && rows.length === 0 && <div className="empty-state">No completed sessions yet.</div>}
        {rows && rows.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Resource</th><th>Start</th><th>End</th><th>Duration</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.PassengerResourceUsageID}>
                    <td>{r.ResourceName}</td>
                    <td className="mono">{r.ResourceUsageStartDT}</td>
                    <td className="mono">{r.ResourceUsageEndDT}</td>
                    <td className="dur mono">{formatDuration(r.ResourceUsageTotalDuration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="note">In-use resources you're currently holding are excluded from history until returned.</footer>
    </>
  );
}
