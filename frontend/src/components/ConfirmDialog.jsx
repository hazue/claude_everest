// Generic confirm modal for soft-delete actions. `error` shows a blocked-deletion
// reason (e.g. "still assigned to a Passenger") returned by the API instead of a
// silently-disabled action.
export default function ConfirmDialog({ open, title, body, error, busy, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="session-scrim visible">
      <div className="confirm-modal" role="alertdialog" aria-modal="true">
        <h2>{title}</h2>
        <p>{body}</p>
        {error && <p className="error-text">{error}</p>}
        <div className="form-actions">
          <button className="btn ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
