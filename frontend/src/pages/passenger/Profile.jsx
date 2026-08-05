import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiFetch } from '../../api.js';
import TierChip from '../../components/TierChip.jsx';

export default function Profile() {
  const { logout } = useOutletContext();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/passenger/profile').then(setProfile).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="pagehead">
          <h1 className="display">Profile</h1>
          <p>Your account, as recorded by the ship.</p>
        </div>
        <button className="logout-btn" onClick={logout}>Log out</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {profile && (
        <section className="panel" style={{ maxWidth: '28rem' }}>
          <div className="panel-head">Account details</div>
          <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="field">
              <label>Name</label>
              <div style={{ fontSize: '0.95rem' }}>{profile.PassengerName}</div>
            </div>
            <div className="field">
              <label>Current tier</label>
              <div><TierChip name={profile.PassengerTierName} /></div>
            </div>
            <div className="field">
              <label>Passenger ID</label>
              <div className="mono">Passenger_{profile.PassengerID}</div>
            </div>
          </div>
        </section>
      )}

      <footer className="note">This page is read-only — tier changes are made by a Crew Lead.</footer>
    </>
  );
}
