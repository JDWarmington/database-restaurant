# Restaurant Tracker Website Design

## Project Overview

Restaurant Tracker is a personal dining journal that helps users track restaurants they have visited, rate restaurants, rate meals, upload food and restaurant media, save future restaurants and meals to a wishlist, and receive meal recommendations based on past ratings.

The app should feel like a polished personal journal rather than a generic food delivery app. The design direction is warm, editorial, organized, and photo-friendly.

---

## Design Goals

1. Make restaurant and meal tracking simple and enjoyable.
2. Give users a clear history of restaurants they have visited.
3. Allow users to rate both restaurants and individual meals.
4. Support media uploads for meals, restaurants, menus, receipts, and ambience.
5. Help users remember places they want to visit and meals they want to try.
6. Recommend meals based on previous ratings and cuisine preferences.
7. Keep the interface clean, complete, and easy to navigate.
8. Make the system feel personal, like a dining journal.

---

## Visual Style

### Theme

The interface should use a warm dining-journal style inspired by restaurant notebooks, menus, and editorial food magazines.

### Mood

- Warm
- Personal
- Organized
- Editorial
- Calm
- Food-focused
- Photo-friendly

### Color Palette

| Purpose | Color | Hex |
|---|---:|---|
| Background | Warm parchment | `#F5F1E8` |
| Surface cards | Soft cream | `#FFFDF7` |
| Primary text | Charcoal | `#2F3136` |
| Secondary text | Muted gray-brown | `#6F6A5F` |
| Primary action | Deep teal | `#192830` |
| Accent | Burnt orange | `#C96F3A` |
| Border | Light linen | `#DED8C8` |
| Success | Olive green | `#6F7D4F` |
| Warning | Golden ochre | `#D39B35` |
| Error | Muted red | `#B75C4A` |

### Typography

| Element | Style |
|---|---|
| Page titles | Large, bold, editorial |
| Section headings | Medium-large, semibold |
| Body text | Clean and readable |
| Labels | Small uppercase or semibold |
| Ratings | Bold and easy to scan |

Recommended font pairing:

- Headings: serif or editorial-style font
- Body: clean sans-serif font

Example:

```css
--font-heading: "Playfair Display", Georgia, serif;
--font-body: "Inter", Arial, sans-serif;
```

### Layout

- Use a centered max-width layout for most pages.
- Use cards for restaurants, meals, ratings, wishlist items, and recommendations.
- Use large food and restaurant photos where helpful.
- Avoid visual clutter.
- Prioritize spacing, rounded corners, and clear hierarchy.

### Border Radius

| Element | Radius |
|---|---:|
| Buttons | 12px |
| Cards | 20px |
| Images | 18px |
| Inputs | 10px |
| Modals | 24px |

---

## Core User Requirements

The user should be able to:

1. Create an account and log in.
2. Add and manage restaurants.
3. Track restaurants they have visited.
4. Rate restaurants.
5. Add meals connected to restaurants.
6. Rate meals they have eaten.
7. Upload and view media for meals and restaurants.
8. Add restaurants to a wishlist.
9. Add meals to a wishlist.
10. Receive meal recommendations based on previous ratings.

---

## Database Tables

The interface should support the following tables:

1. `Users`
2. `Restaurants`
3. `Restaurants_Visited`
4. `Restaurant_Meals`
5. `Meal_Ratings`
6. `Restaurant_Ratings`
7. `Media`
8. `Wishlist`

---

## Site Map

```text
/
├── Login
├── Register
├── Dashboard
├── Restaurants
│   ├── Restaurant Detail
│   ├── Add Restaurant
│   └── Edit Restaurant
├── Visits
│   ├── Log Visit
│   └── Visit Detail
├── Meals
│   ├── Meal Detail
│   └── Add Meal
├── Ratings
│   ├── Restaurant Rating Form
│   └── Meal Rating Form
├── Wishlist
├── Recommendations
├── Media Gallery
└── Profile
```

---

## Main Navigation

The main navigation should include:

- Dashboard
- Restaurants
- Visits
- Meals
- Wishlist
- Recommendations
- Gallery
- Profile

On smaller screens, navigation should collapse into a mobile menu.

---

## Page Designs

## 1. Login Page

### Purpose

Allow existing users to access their account.

### Required Elements

- App logo or title
- Email input
- Password input
- Login button
- Link to register
- Optional short tagline

### Layout

A centered card on a warm parchment background.

### Example Content

Title: `Welcome back`

Subtitle: `Log your latest restaurant visit, meal rating, or wishlist idea.`

Primary button: `Log In`

---

## 2. Register Page

### Purpose

Allow new users to create an account.

### Required Elements

- Username input
- Email input
- Password input
- Confirm password input
- Create account button
- Link to login

### Layout

Similar to login page for consistency.

---

## 3. Dashboard Page

### Purpose

Give the user a quick overview of their restaurant tracking activity.

### Required Sections

1. Welcome message
2. Stats cards
3. Recently visited restaurants
4. Top-rated meals
5. Wishlist preview
6. Recommended meals

### Stats Cards

Examples:

- Restaurants Visited
- Meals Rated
- Wishlist Items
- Average Restaurant Rating

### Dashboard Card Example

```text
Recently Visited
------------------------------------------------
[Photo] The Green Table
Italian • Chicago • Visited Apr 20, 2026
Overall Rating: 4.7/5
```

### Primary Actions

- `Add Restaurant`
- `Log Visit`
- `Add Meal`
- `View Recommendations`

---

## 4. Restaurants Page

### Purpose

Show all restaurants saved by the user or available in the system.

### Required Features

- Search by restaurant name
- Filter by cuisine
- Filter by city
- Filter by price range
- Sort by rating, most recent, or alphabetical
- Add restaurant button

### Restaurant Card

Each card should include:

- Restaurant photo
- Restaurant name
- Cuisine type
- City
- Price range
- Average rating
- Wishlist or visited status
- Quick action buttons

### Example Card

```text
The Green Table
Italian • Chicago • $$
Average Rating: 4.6
Visited 3 times

[View Details] [Log Visit]
```

---

## 5. Restaurant Detail Page

### Purpose

Show full information about one restaurant.

### Required Sections

1. Hero image
2. Restaurant details
3. Average restaurant rating
4. Visit history
5. Meals available
6. Uploaded media
7. Wishlist status
8. User notes

### Key Actions

- `Log Visit`
- `Rate Restaurant`
- `Add Meal`
- `Upload Media`
- `Add to Wishlist`

### Restaurant Details

Display:

- Name
- Cuisine type
- Address
- City
- Price range
- Description

---

## 6. Add Restaurant Page

### Purpose

Allow users to add a new restaurant.

### Form Fields

- Restaurant name
- Cuisine type
- Address
- City
- Price range
- Description
- Optional photo upload

### Validation

- Restaurant name is required.
- Cuisine type is required.
- City is required.
- Price range must be selected from valid values.

### Primary Button

`Save Restaurant`

---

## 7. Log Visit Page

### Purpose

Track when a user visited a restaurant.

### Form Fields

- Restaurant selection
- Visit date
- Occasion
- Party size
- Notes

### Optional Follow-Up Actions

After saving a visit, users should be prompted to:

- Rate the restaurant
- Add meals eaten
- Upload photos

### Primary Button

`Save Visit`

---

## 8. Visit Detail Page

### Purpose

Show the details of a specific restaurant visit.

### Required Sections

- Restaurant name
- Date visited
- Occasion
- Visit notes
- Meals eaten during that visit
- Meal ratings
- Restaurant rating
- Media from the visit

### Key Actions

- `Add Meal Rating`
- `Rate Restaurant`
- `Upload Visit Media`

---

## 9. Meals Page

### Purpose

Show meals connected to restaurants.

### Required Features

- Search by meal name
- Filter by restaurant
- Filter by cuisine
- Filter by category
- Sort by highest rated, recently added, or price

### Meal Card

Each meal card should include:

- Meal photo
- Meal name
- Restaurant name
- Category
- Price
- Average rating
- Wishlist status

### Example Card

```text
Spicy Rigatoni
The Green Table
Entree • $18
Average Rating: 4.8

[View Meal] [Add to Wishlist]
```

---

## 10. Meal Detail Page

### Purpose

Show information about one meal.

### Required Sections

- Meal photo
- Meal name
- Restaurant name
- Category
- Description
- Price
- Average meal rating
- User reviews
- Media
- Recommendation status

### Key Actions

- `Rate Meal`
- `Add to Wishlist`
- `Upload Meal Photo`

---

## 11. Add Meal Page

### Purpose

Allow users to add a meal served by a restaurant.

### Form Fields

- Restaurant selection
- Meal name
- Category
- Description
- Price
- Optional photo upload

### Validation

- Restaurant is required.
- Meal name is required.
- Category is required.

### Primary Button

`Save Meal`

---

## 12. Restaurant Rating Form

### Purpose

Allow users to rate a restaurant after a visit.

### Form Fields

- Restaurant
- Visit
- Food rating
- Service rating
- Atmosphere rating
- Value rating
- Overall rating
- Review text

### Rating Scale

Use a 1 to 5 scale.

### Primary Button

`Save Restaurant Rating`

---

## 13. Meal Rating Form

### Purpose

Allow users to rate a meal they ate.

### Form Fields

- Meal
- Visit
- Taste rating
- Presentation rating
- Value rating
- Overall rating
- Review text

### Rating Scale

Use a 1 to 5 scale.

### Primary Button

`Save Meal Rating`

---

## 14. Wishlist Page

### Purpose

Show restaurants and meals the user wants to try in the future.

### Required Features

- Separate tabs for restaurants and meals
- Priority level
- Notes
- Date added
- Remove from wishlist
- Mark as visited or tried

### Wishlist Item Card

```text
High Priority
Sushi Hana
Japanese • Chicago

Reason: Try the omakase menu.

[Mark as Visited] [Remove]
```

### Key Actions

- `Add Restaurant to Wishlist`
- `Add Meal to Wishlist`
- `Mark as Completed`

---

## 15. Recommendations Page

### Purpose

Recommend meals based on previous user ratings.

### Recommendation Logic

The system can recommend meals by using:

- Meals with high average ratings
- Cuisine types the user rates highly
- Restaurants similar to ones the user liked
- Meals the user has not rated yet
- Meals not already in the wishlist

### Required Sections

1. Recommended for You
2. Based on Your Favorite Cuisines
3. Highly Rated Meals Nearby
4. Similar to Meals You Liked

### Recommendation Card

```text
Recommended Meal
Birria Tacos
Casa Azul
Mexican • 4.8 average rating

Reason: You often rate Mexican dishes highly.

[View Meal] [Add to Wishlist]
```

---

## 16. Media Gallery Page

### Purpose

Show all uploaded restaurant and meal media.

### Required Features

- Grid of media cards
- Filter by restaurant
- Filter by meal
- Filter by media type
- Captions
- Upload date

### Media Types

- Restaurant photo
- Meal photo
- Menu photo
- Receipt photo
- Ambience photo

### Key Actions

- `Upload Media`
- `View Related Restaurant`
- `View Related Meal`

---

## 17. Profile Page

### Purpose

Allow the user to manage their account and see summary statistics.

### Required Sections

- Username
- Email
- Account creation date
- Total restaurants visited
- Total meals rated
- Favorite cuisine
- Average restaurant rating
- Average meal rating

### Key Actions

- `Edit Profile`
- `Log Out`

---

## Reusable Components

## 1. Button

### Variants

- Primary
- Secondary
- Outline
- Danger
- Ghost

### Style

Primary button:

```css
background: #192830;
color: #FFFDF7;
border-radius: 12px;
padding: 12px 18px;
font-weight: 600;
```

---

## 2. Card

Used for restaurants, meals, ratings, wishlist items, recommendations, and dashboard sections.

### Style

```css
background: #FFFDF7;
border: 1px solid #DED8C8;
border-radius: 20px;
box-shadow: 0 8px 24px rgba(25, 40, 48, 0.08);
padding: 20px;
```

---

## 3. Rating Display

### Purpose

Show average ratings and user ratings.

### Format

- Use numeric rating: `4.7 / 5`
- Optional stars for visual support
- Use different labels for restaurant and meal ratings

Example:

```text
Overall Rating: 4.7 / 5
Food: 5
Service: 4
Atmosphere: 5
Value: 4
```

---

## 4. Tag / Pill

Used for cuisine, city, category, price range, occasion, and priority.

### Example Tags

- Italian
- Japanese
- Date Night
- Dessert
- High Priority
- $$
- Visited

---

## 5. Search and Filter Bar

Used on Restaurants, Meals, Wishlist, Recommendations, and Media pages.

### Required Elements

- Search input
- Filter dropdowns
- Sort dropdown
- Clear filters button

---

## 6. Photo Upload Component

### Purpose

Allow users to upload photos for restaurants, meals, visits, or media gallery.

### Required Fields

- File upload
- Media type
- Caption
- Related restaurant
- Optional related meal
- Optional related visit

---

## 7. Empty State

Used when a page has no content yet.

### Examples

Restaurants empty state:

```text
No restaurants yet.
Start building your dining journal by adding your first restaurant.

[Add Restaurant]
```

Wishlist empty state:

```text
Your wishlist is empty.
Save restaurants and meals you want to try later.

[Browse Restaurants]
```

---

## Interaction Design

### Add Restaurant Flow

1. User clicks `Add Restaurant`.
2. User completes restaurant form.
3. System validates required fields.
4. Restaurant is saved.
5. User is sent to the restaurant detail page.

### Log Visit Flow

1. User selects a restaurant.
2. User enters visit date, occasion, and notes.
3. Visit is saved.
4. User is prompted to rate the restaurant or add meals eaten.

### Rate Meal Flow

1. User selects a meal.
2. User links it to a visit.
3. User enters taste, presentation, value, and overall ratings.
4. Meal rating is saved.
5. Meal average rating updates.

### Wishlist Flow

1. User clicks `Add to Wishlist` on a restaurant or meal.
2. User selects priority.
3. User adds optional notes.
4. Wishlist item is saved.
5. User can later mark it as visited or tried.

### Recommendation Flow

1. System checks previous meal ratings.
2. System finds highly rated cuisines and meals.
3. System excludes meals already rated by the user.
4. System displays recommended meals.
5. User can view the meal or add it to wishlist.

---

## Data Validation Rules

### Users

- Email must be unique.
- Password must be securely stored as a hash.
- Username is required.

### Restaurants

- Name is required.
- Cuisine type is required.
- City is required.
- Price range must be valid.

### Visits

- User is required.
- Restaurant is required.
- Visit date is required.

### Meals

- Restaurant is required.
- Meal name is required.
- Category is required.
- Price cannot be negative.

### Ratings

- Ratings must be between 1 and 5.
- A rating must be linked to a user.
- A meal rating must be linked to a meal.
- A restaurant rating must be linked to a restaurant.

### Media

- Media URL or file path is required.
- Media must be linked to a user.
- Media type is required.

### Wishlist

- User is required.
- Wishlist type must be either restaurant or meal.
- At least one of restaurant_id or meal_id must be present.

---

## Accessibility Requirements

- All images should have alt text.
- Buttons should have clear labels.
- Forms should use visible labels.
- Error messages should be readable and specific.
- Color should not be the only way to communicate status.
- Text should have strong contrast against the background.
- Keyboard navigation should work across the app.

---

## Responsive Design

### Desktop

- Use multi-column grids for cards.
- Show full navigation in the header or sidebar.
- Use larger hero sections on detail pages.

### Tablet

- Use two-column card layouts.
- Keep filters collapsible if needed.

### Mobile

- Use single-column layouts.
- Collapse navigation into a menu.
- Keep primary actions sticky or easy to reach.
- Use large tap targets.

---

## Suggested CSS Variables

```css
:root {
  --color-background: #F5F1E8;
  --color-surface: #FFFDF7;
  --color-text: #2F3136;
  --color-muted: #6F6A5F;
  --color-primary: #192830;
  --color-accent: #C96F3A;
  --color-border: #DED8C8;
  --color-success: #6F7D4F;
  --color-warning: #D39B35;
  --color-error: #B75C4A;

  --radius-sm: 10px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 24px;

  --shadow-card: 0 8px 24px rgba(25, 40, 48, 0.08);
}
```

---

## Example Page Wireframe

### Dashboard

```text
 ---------------------------------------------------------
| Restaurant Tracker                         Profile Menu |
 ---------------------------------------------------------

 Welcome back, Alex
 Track your favorite restaurants, meals, and future cravings.

 [Restaurants Visited] [Meals Rated] [Wishlist Items] [Avg Rating]

 ---------------------------------------------------------
| Recently Visited                                        |
| [Photo] The Green Table      Italian • Chicago • 4.7    |
| [Photo] Casa Azul            Mexican • Chicago • 4.8    |
 ---------------------------------------------------------

 ---------------------------------------------------------
| Recommended Meals                                       |
| [Photo] Birria Tacos       Because you like Mexican     |
| [Photo] Spicy Rigatoni     Similar to meals you rated   |
 ---------------------------------------------------------

 ---------------------------------------------------------
| Wishlist                                                |
| Sushi Hana              High Priority                   |
| Mango Sticky Rice       Medium Priority                 |
 ---------------------------------------------------------
```

---

## Bug-Free Interface Expectations

The interface should:

- Prevent users from submitting incomplete required forms.
- Show helpful error messages.
- Confirm when data is saved successfully.
- Prevent duplicate wishlist items when possible.
- Prevent invalid ratings outside the 1 to 5 range.
- Keep restaurant ratings separate from meal ratings.
- Keep restaurants separate from visits.
- Work on desktop, tablet, and mobile.
- Use consistent navigation and button behavior.
- Display empty states when no data exists.

---

## Final Design Summary

Restaurant Tracker should feel like a warm, personal dining journal. Users should be able to quickly log a restaurant visit, rate meals, save photos, manage wishlists, and discover recommended meals. The design should use warm colors, clean cards, strong photography, clear rating displays, and simple navigation.

The most important design rule is to keep the system organized around three main ideas:

1. Restaurants are places.
2. Visits are experiences at those places.
3. Meals are individual items that can be rated, saved, photographed, and recommended.
