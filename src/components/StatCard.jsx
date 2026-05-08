export default function StatCard({ label, value, hint }) {
  return (
    <div className="stat-card" role="group" aria-label={label}>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      {hint && <div className="stat-card__hint">{hint}</div>}
    </div>
  );
}
