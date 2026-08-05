import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import SessionGuard from './SessionGuard.jsx';

// Shared kiosk shell for both Passenger and CrewLead sections. `navItems` is
// [{ to, label }]. Identity (name + id) is read from the session itself, not passed in,
// so the shell always reflects who's actually logged in.
export default function AppShell({ brandTitle, brandSubtitle, navItems, loginPath }) {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/heartbeat', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const { identity: id } = data;
        const idLabel = id.role === 'Passenger' ? `Passenger_${id.passengerId}` : `CrewLead_${id.crewLeadId}`;
        setIdentity({ name: id.name, idLabel });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    navigate(loginPath);
  }

  const initials = (identity?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="shell">
      <nav className="nav">
        <div className="brand">
          <span className="mark">PR</span>
          <span className="title display">{brandTitle}</span>
          <span className="subtitle">{brandSubtitle}</span>
        </div>
        <div className="navlist">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `navitem${isActive ? ' active' : ''}`}
            >
              <span className="dot" />
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="nav-foot">
          <div className="id-chip">
            <span className="avatar">{initials}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{identity?.name}</div>
              <div style={{ color: 'var(--ink-soft)', fontSize: '0.74rem' }}>{identity?.idLabel}</div>
            </div>
          </div>
        </div>
      </nav>
      <main className="main">
        <Outlet context={{ logout }} />
      </main>
      <SessionGuard loginPath={loginPath} />
    </div>
  );
}
