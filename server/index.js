import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import users from './routes/users.js';
import restaurants from './routes/restaurants.js';
import meals from './routes/meals.js';
import visits from './routes/visits.js';
import restaurantRatings from './routes/restaurant-ratings.js';
import mealRatings from './routes/meal-ratings.js';
import wishlist from './routes/wishlist.js';
import media from './routes/media.js';
import recommendations from './routes/recommendations.js';

const app = express();

app.use(cors());
// Base64 images can be large; bump the JSON body limit accordingly.
app.use(express.json({ limit: '10mb' }));

// Liveness check — does NOT touch the database. Use this to confirm the
// server itself is up.
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Readiness check — pings PostgreSQL. Will fail until server/db.js is wired
// up.
app.get('/api/health/db', async (req, res) => {
  try {
    const { query } = await import('./db.js');
    const r = await query('SELECT NOW() AS now');
    res.json({ ok: true, now: r.rows[0].now });
  } catch (e) {
    // Node 22 wraps multi-address connect failures in AggregateError, whose
    // top-level .message is "". Pull the inner error so the response is useful.
    const inner = (e && e.errors && e.errors[0]) || e;
    let msg = (inner && (inner.message || inner.code)) || e.message || 'Unknown DB error.';
    if (inner && inner.code === 'ECONNREFUSED') {
      msg = 'Cannot reach PostgreSQL — is it installed and running on the configured host/port?';
    } else if (inner && inner.code === '3D000') {
      msg = 'Database does not exist — run `npm run db:reset` (or createdb).';
    } else if (inner && inner.code === '28P01') {
      msg = 'Authentication failed — check PGUSER / PGPASSWORD in .env.';
    }
    res.status(500).json({ ok: false, error: msg });
  }
});

app.use('/api', users);
app.use('/api', restaurants);
app.use('/api', meals);
app.use('/api', visits);
app.use('/api', restaurantRatings);
app.use('/api', mealRatings);
app.use('/api', wishlist);
app.use('/api', media);
app.use('/api', recommendations);

app.use((err, req, res, _next) => {
  // HttpError thrown by route helpers carries an explicit status (400/404/409).
  if (err && typeof err.status === 'number') {
    return res.status(err.status).json({ error: err.message || 'Request failed.' });
  }
  // Postgres errors arrive with a `code` (SQLSTATE). Map a couple to friendly
  // 4xx responses; everything else is a 500.
  if (err && err.code) {
    if (err.code === '23514') {
      // CHECK violation, e.g. rating outside [1, 10].
      return res.status(400).json({ error: 'Value violates a database constraint.' });
    }
    if (err.code === '23503') {
      // Foreign key violation.
      return res.status(400).json({ error: 'Referenced row does not exist.' });
    }
    if (err.code === '23505') {
      // Unique violation.
      return res.status(409).json({ error: 'Duplicate entry.' });
    }
  }
  console.error('[api]', err);
  res.status(500).json({ error: err && err.message ? err.message : 'Server error.' });
});

const PORT = Number(process.env.SERVER_PORT || 3001);
app.listen(PORT, () => {
  console.log(`Restaurant Tracker API listening on http://localhost:${PORT}`);
});
