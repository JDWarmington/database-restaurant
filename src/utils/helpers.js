export function formatDate(value) {
  if (!value) return '';
  // Postgres DATE columns come back as 'YYYY-MM-DD'. `new Date(str)` parses
  // those as UTC midnight, which `toLocaleDateString` then shifts back a day
  // for any timezone west of UTC. Build a local-midnight Date instead.
  if (typeof value === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (m) {
      const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatPrice(value) {
  if (value == null || value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return '';
  return num.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
}

export function average(numbers) {
  const list = numbers
    .map((n) => (typeof n === 'number' ? n : Number(n)))
    .filter((n) => Number.isFinite(n));
  if (!list.length) return 0;
  return list.reduce((a, b) => a + b, 0) / list.length;
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural || `${singular}s`}`;
}

export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Cuisine list is used by the meal form + filter. Cuisine lives on
// RestaurantMeals in the schema (not Restaurant).
export const CUISINES = [
  'Italian',
  'Mexican',
  'Japanese',
  'American',
  'Thai',
  'Chinese',
  'Indian',
  'Mediterranean',
  'French',
  'Korean',
  'Vietnamese',
  'Bakery',
  'Steakhouse',
  'Seafood',
  'Other',
];

// Read a File object as a base64 data URL (used for Media.ImageAsText).
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}
