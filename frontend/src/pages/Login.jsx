import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Shared by both Passenger and CrewLead login routes — same component, same look,
// per projectspec.md ("Crew Lead and Passenger should be separate login page, but the
// UI can look identical"). Only the endpoint/redirect differ, driven by `role`.
export default function Login({ role }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const isPassenger = role === 'Passenger';
  const endpoint = isPassenger ? '/api/auth/passenger/login' : '/api/auth/crewlead/login';
  const homePath = isPassenger ? '/passenger/profile' : '/crewlead/passengers';
  const otherPath = isPassenger ? '/login/crewlead' : '/login/passenger';

  async function submit(e) {
    e.preventDefault();
    if (!code || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: code }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Access code not recognized.');
        setCode('');
        return;
      }
      navigate(homePath);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-mark">PR</div>
        <div>
          <h1 className="display">{isPassenger ? 'Passenger Login' : 'Crew Lead Login'}</h1>
          <p className="sub">Scan your access card at the reader to continue.</p>
        </div>

        <div className="reader">
          <span className="reader-dot" />
          <span className="reader-text">{busy ? 'Checking card…' : 'Waiting for card scan…'}</span>
        </div>

        <form onSubmit={submit} className="form-grid" style={{ gap: '0.75rem' }}>
          <div className="field">
            <label htmlFor="accessCode">Access code (masked)</label>
            <input
              id="accessCode"
              type="password"
              autoComplete="off"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="•••••••••••"
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn primary" type="submit" disabled={!code || busy}>
            {busy ? 'Checking…' : 'Continue'}
          </button>
        </form>

        <p className="shared-device-note">
          This is a shared device. Log out immediately after use — any misuse while the
          session is left open is your responsibility.
        </p>

        <p className="login-switch">
          {isPassenger ? 'Crew Lead?' : 'Passenger?'} <Link to={otherPath}>Use the {isPassenger ? 'Crew Lead' : 'Passenger'} login</Link>
        </p>
      </div>
    </div>
  );
}
