import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WARNING_AT_MS = 10000;

// Polls the heartbeat endpoint every second. The poll itself is a read (peekSession on
// the server) and never resets the inactivity clock. Only in the final 10 seconds does
// a modal appear, matching projectspec.md's banking-style warning — silence until then.
export default function SessionGuard({ loginPath }) {
  const [remainingMs, setRemainingMs] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch('/api/auth/heartbeat', { credentials: 'same-origin' });
        if (cancelled) return;
        if (res.status === 401) {
          navigate(loginPath);
          return;
        }
        const data = await res.json();
        setRemainingMs(data.remainingMs);
      } catch {
        // transient network error — try again next tick
      }
    }

    const interval = setInterval(tick, 1000);
    tick();
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [navigate, loginPath]);

  const visible = remainingMs !== null && remainingMs <= WARNING_AT_MS;
  const secondsLeft = visible ? Math.max(0, Math.ceil(remainingMs / 1000)) : 10;

  async function resume() {
    try {
      await fetch('/api/auth/touch', { method: 'POST', credentials: 'same-origin' });
      setRemainingMs(60000);
    } catch {
      // if this fails the next heartbeat tick will surface the real state
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    navigate(loginPath);
  }

  return (
    <div className={`session-scrim${visible ? ' visible' : ''}`}>
      {visible && (
        <div className="session-modal" role="alertdialog" aria-modal="true" aria-labelledby="sessionModalTitle">
          <Ring seconds={secondsLeft} />
          <h2 id="sessionModalTitle">Still there?</h2>
          <p>You've been inactive — for your security, this session will log out automatically on a shared device.</p>
          <div className="session-modal-actions">
            <button className="modal-logout-btn" onClick={logout}>Log out</button>
            <button className="resume-btn" onClick={resume}>Resume session</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Ring({ seconds }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 72;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2, cy = size / 2, r = size / 2 - 5;
    const styles = getComputedStyle(document.documentElement);
    const track = styles.getPropertyValue('--line').trim();
    const crit = styles.getPropertyValue('--crit').trim();
    const fraction = seconds / 10;

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = track;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction);
    ctx.strokeStyle = crit;
    ctx.stroke();
  }, [seconds]);

  return (
    <div className="ring">
      <canvas ref={canvasRef} width="72" height="72" />
      <span className="ring-num mono">{seconds}</span>
    </div>
  );
}
