// variant: 'available' | 'in-use' | 'locked-you'
export default function StatusPill({ variant, children }) {
  return (
    <span className={`status ${variant}`}>
      <span className="dot" />
      {children}
    </span>
  );
}
