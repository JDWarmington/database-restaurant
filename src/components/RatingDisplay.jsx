// 1–10 numeric rating with a 10-dot visual indicator.
export default function RatingDisplay({ value = 0, label = 'Rating', count, showDots = true }) {
  const safe = Math.max(0, Math.min(10, Number(value) || 0));
  const filled = Math.round(safe);
  const dots = Array.from({ length: 10 }, (_, i) => i < filled);

  const labelText = `${label}: ${safe ? safe.toFixed(1) : 'no'} out of 10${
    count != null ? `, from ${count} ratings` : ''
  }`;

  return (
    <span className="rating" aria-label={labelText}>
      <span className="rating__value">
        {safe ? safe.toFixed(1) : '—'}
        <span className="subtle" style={{ fontWeight: 400 }}> / 10</span>
      </span>
      {showDots && (
        <span className="rating__dots" aria-hidden="true">
          {dots.map((on, i) => (
            <span
              key={i}
              className={`rating__dot${on ? '' : ' rating__dot--empty'}`}
            />
          ))}
        </span>
      )}
      {count != null && (
        <span className="subtle" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
          ({count})
        </span>
      )}
    </span>
  );
}
