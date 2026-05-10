export function formatDate(value) {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
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
