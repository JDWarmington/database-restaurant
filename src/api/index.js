// Frontend API entry point.
//
// `VITE_DATA_MODE=mock` (default) — uses src/api/mockApi.js (localStorage).
// `VITE_DATA_MODE=api`            — uses src/api/realApi.js (fetch /api/...).
//
// Components should import only from this module — never from mockApi.js,
// realApi.js, or localStorage directly.

import * as mock from './mockApi.js';
import * as real from './realApi.js';

export const dataMode = import.meta.env.VITE_DATA_MODE === 'api' ? 'api' : 'mock';
export const api = dataMode === 'api' ? real : mock;

// Session helpers — separate from the data API so they apply to both modes.
export { getCurrentUser, setCurrentUser } from './session.js';
