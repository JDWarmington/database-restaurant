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
    res.status(500).json({ ok: false, error: e.message });
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
  console.error('[api]', err);
  res.status(500).json({ error: err.message || 'Server error.' });
});

const PORT = Number(process.env.SERVER_PORT || 3001);
app.listen(PORT, () => {
  console.log(`Restaurant Tracker API listening on http://localhost:${PORT}`);
});
