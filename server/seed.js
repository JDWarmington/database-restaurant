// Seed PostgreSQL with the same dataset the mock api uses on first run.
// Demo logins: alex@demo.com / demo123  and  sam@demo.com / demo123.
//
// Run: `npm run seed` (assumes the database has been created and the
// schema applied — see database/SETUP.md).

import bcrypt from 'bcryptjs';
import pool, { withTx } from './db.js';

const IMG = {
  red:    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  orange: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  yellow: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  green:  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  blue:   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
};

const daysAgo = (n) =>
  new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

async function main() {
  const hash = await bcrypt.hash('demo123', 10);

  const users = [
    { id: 1, username: 'alex', email: 'alex@demo.com', password: hash },
    { id: 2, username: 'sam',  email: 'sam@demo.com',  password: hash },
  ];
  const restaurants = [
    { id: 1, name: 'The Green Table', website: 'https://greentable.example.com', email: 'hello@greentable.example.com', phone: '312-555-0101', address: '218 Cedar Ave, Chicago, IL' },
    { id: 2, name: 'Casa Azul',       website: 'https://casaazul.example.com',   email: 'hi@casaazul.example.com',     phone: '312-555-0102', address: '54 Calle del Sol, Chicago, IL' },
    { id: 3, name: 'Sushi Hana',      website: null,                              email: null,                          phone: '312-555-0103', address: '8 Hibiscus St, Chicago, IL' },
    { id: 4, name: 'Ember & Oak',     website: 'https://emberoak.example.com',    email: null,                          phone: null,           address: '1200 Clinton Rd, Madison, WI' },
    { id: 5, name: 'Basil Garden',    website: null,                              email: 'order@basilgarden.example.com', phone: '847-555-0105', address: '77 Lakeshore Pl, Evanston, IL' },
  ];
  const meals = [
    { id: 1, restaurantId: 1, name: 'Spicy Rigatoni',  cuisine: 'Italian',  price: 18.00 },
    { id: 2, restaurantId: 1, name: 'Carbonara',       cuisine: 'Italian',  price: 22.00 },
    { id: 3, restaurantId: 2, name: 'Birria Tacos',    cuisine: 'Mexican',  price: 16.00 },
    { id: 4, restaurantId: 2, name: 'Guacamole',       cuisine: 'Mexican',  price: 12.00 },
    { id: 5, restaurantId: 3, name: 'Chef Omakase',    cuisine: 'Japanese', price: 95.00 },
    { id: 6, restaurantId: 3, name: 'Miso Black Cod',  cuisine: 'Japanese', price: 38.00 },
    { id: 7, restaurantId: 4, name: 'Bone-in Ribeye',  cuisine: 'American', price: 68.00 },
    { id: 8, restaurantId: 5, name: 'Pad Thai',        cuisine: 'Thai',     price: 15.00 },
  ];
  const visits = [
    { id: 1, userId: 1, restaurantId: 1, dateVisited: daysAgo(50) },
    { id: 2, userId: 1, restaurantId: 2, dateVisited: daysAgo(35) },
    { id: 3, userId: 1, restaurantId: 3, dateVisited: daysAgo(20) },
    { id: 4, userId: 1, restaurantId: 5, dateVisited: daysAgo(12) },
    { id: 5, userId: 1, restaurantId: 1, dateVisited: daysAgo(5)  },
    { id: 6, userId: 2, restaurantId: 3, dateVisited: daysAgo(8)  },
  ];
  const restaurantRatings = [
    { id: 1, restaurantId: 1, userId: 1, rating: 9,  comments: 'Honestly one of my favorite places in the city.', ratingDate: daysAgo(50) },
    { id: 2, restaurantId: 2, userId: 1, rating: 10, comments: 'Birria was the best I have had outside of Tijuana.', ratingDate: daysAgo(35) },
    { id: 3, restaurantId: 3, userId: 1, rating: 10, comments: 'A genuine occasion meal. Worth every dollar.', ratingDate: daysAgo(20) },
    { id: 4, restaurantId: 5, userId: 1, rating: 8,  comments: 'Easy weeknight pick. Service is genuinely warm.', ratingDate: daysAgo(12) },
    { id: 5, restaurantId: 3, userId: 2, rating: 9,  comments: 'Counter seats are the best in the city.', ratingDate: daysAgo(7) },
  ];
  const mealRatings = [
    { id: 1, userId: 1, restaurantMealId: 1, rating: 10, comments: 'The Calabrian heat sneaks up on you. Order it.', ratingDate: daysAgo(50) },
    { id: 2, userId: 1, restaurantMealId: 3, rating: 10, comments: 'I would drive to Chicago just for this taco.',    ratingDate: daysAgo(35) },
    { id: 3, userId: 1, restaurantMealId: 4, rating: 8,  comments: 'Solid. Order spicy.',                              ratingDate: daysAgo(35) },
    { id: 4, userId: 1, restaurantMealId: 5, rating: 10, comments: 'A masterclass — paced beautifully.',               ratingDate: daysAgo(20) },
    { id: 5, userId: 1, restaurantMealId: 8, rating: 8,  comments: 'Bright, balanced, not overly sweet.',              ratingDate: daysAgo(12) },
    { id: 6, userId: 1, restaurantMealId: 2, rating: 9,  comments: 'Properly creamy without being heavy.',             ratingDate: daysAgo(5)  },
    { id: 7, userId: 2, restaurantMealId: 6, rating: 9,  comments: 'Three-day marinade was worth it.',                 ratingDate: daysAgo(7)  },
  ];
  const wishlist = [
    { id: 1, userId: 1, restaurantId: 3, foodsToTry: 'Try the omakase when seasonal fish rotates.' },
    { id: 2, userId: 1, restaurantId: 4, foodsToTry: 'Bone-in ribeye, dry-aged.' },
    { id: 3, userId: 2, restaurantId: 5, foodsToTry: 'Pad thai, no peanuts.' },
  ];
  const media = [
    { id: 1, userId: 1, restaurantMealId: 1, date: daysAgo(50), imageAsText: IMG.red },
    { id: 2, userId: 1, restaurantMealId: 3, date: daysAgo(35), imageAsText: IMG.orange },
    { id: 3, userId: 1, restaurantMealId: 5, date: daysAgo(20), imageAsText: IMG.green },
    { id: 4, userId: 1, restaurantMealId: 8, date: daysAgo(12), imageAsText: IMG.yellow },
    { id: 5, userId: 2, restaurantMealId: 6, date: daysAgo(7),  imageAsText: IMG.blue },
  ];

  await withTx(async (c) => {
    // Wipe in dependency order so FKs don't complain.
    await c.query('DELETE FROM "Media"');
    await c.query('DELETE FROM "MealRatings"');
    await c.query('DELETE FROM "RestaurantRatings"');
    await c.query('DELETE FROM "RestaurantVisit"');
    await c.query('DELETE FROM "Wishlist"');
    await c.query('DELETE FROM "RestaurantMeals"');
    await c.query('DELETE FROM "Restaurant"');
    await c.query('DELETE FROM "Users"');

    for (const u of users) {
      await c.query(
        `INSERT INTO "Users" ("UserId", "Username", "Email", "Password")
         VALUES ($1, $2, $3, $4)`,
        [u.id, u.username, u.email, u.password]
      );
    }
    for (const r of restaurants) {
      await c.query(
        `INSERT INTO "Restaurant"
           ("RestaurantId", "RestaurantName", "RestaurantWebsite",
            "RestaurantEmail", "RestaurantPhoneNumber", "Address")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [r.id, r.name, r.website, r.email, r.phone, r.address]
      );
    }
    for (const m of meals) {
      await c.query(
        `INSERT INTO "RestaurantMeals"
           ("RestaurantMealId", "RestaurantId", "MealName", "Cuisine", "Price")
         VALUES ($1, $2, $3, $4, $5)`,
        [m.id, m.restaurantId, m.name, m.cuisine, m.price]
      );
    }
    for (const v of visits) {
      await c.query(
        `INSERT INTO "RestaurantVisit"
           ("RestaurantVisitId", "RestaurantId", "UserId", "DateVisited")
         VALUES ($1, $2, $3, $4)`,
        [v.id, v.restaurantId, v.userId, v.dateVisited]
      );
    }
    for (const r of restaurantRatings) {
      await c.query(
        `INSERT INTO "RestaurantRatings"
           ("RestaurantRatingId", "RestaurantId", "UserId",
            "RatingOneToTen", "Comments", "RatingDate")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [r.id, r.restaurantId, r.userId, r.rating, r.comments, r.ratingDate]
      );
    }
    for (const r of mealRatings) {
      await c.query(
        `INSERT INTO "MealRatings"
           ("MealRatingId", "UserId", "RestaurantMealId",
            "RatingOneToTen", "Comments", "RatingDate")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [r.id, r.userId, r.restaurantMealId, r.rating, r.comments, r.ratingDate]
      );
    }
    for (const w of wishlist) {
      await c.query(
        `INSERT INTO "Wishlist"
           ("WishId", "UserId", "RestaurantId", "FoodsToTry")
         VALUES ($1, $2, $3, $4)`,
        [w.id, w.userId, w.restaurantId, w.foodsToTry]
      );
    }
    for (const m of media) {
      await c.query(
        `INSERT INTO "Media"
           ("MediaID", "UserId", "RestaurantMealId", "Date", "ImageAsText")
         VALUES ($1, $2, $3, $4, $5)`,
        [m.id, m.userId, m.restaurantMealId, m.date, m.imageAsText]
      );
    }
  });

  console.log('Seeded:', {
    users: users.length,
    restaurants: restaurants.length,
    meals: meals.length,
    visits: visits.length,
    restaurantRatings: restaurantRatings.length,
    mealRatings: mealRatings.length,
    wishlist: wishlist.length,
    media: media.length,
  });
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error('Seed failed:', err);
    pool.end().finally(() => process.exit(1));
  });
