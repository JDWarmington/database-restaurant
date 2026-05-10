import { useId } from 'react';

// 1–10 chip selector. Keeps the design palette but is clearer than ten stars.
export default function RatingInput({ label, value = 0, onChange, name, required }) {
  const id = useId();

  return (
    <div className="field">
      {label && (
        <label id={`${id}-label`}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      <div
        className="rating-chip-row"
        role="radiogroup"
        aria-labelledby={label ? `${id}-label` : undefined}
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const active = n <= Number(value);
          const exact = Number(value) === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={exact}
              aria-label={`${n} out of 10`}
              className={`rating-chip${active ? ' is-active' : ''}${exact ? ' is-current' : ''}`}
              onClick={() => onChange?.(n, name)}
            >
              {n}
            </button>
          );
        })}
        <span className="rating-chip-row__value">
          {value ? `${value} / 10` : 'No rating'}
        </span>
      </div>
      <input type="hidden" name={name} value={value || ''} required={required} />
    </div>
  );
}
