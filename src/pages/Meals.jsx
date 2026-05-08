import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import MealCard from '../components/MealCard.jsx';
import SearchFilterBar from '../components/SearchFilterBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Button from '../components/Button.jsx';
import { CUISINES } from '../utils/helpers.js';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest rated' },
  { value: 'recent', label: 'Recently added' },
  { value: 'price-asc', label: 'Price (low → high)' },
  { value: 'price-desc', label: 'Price (high → low)' },
  { value: 'name', label: 'Name (A–Z)' },
];

export default function Meals() {
  const data = useData();

  const [search, setSearch] = useState('');
  const [restaurantId, setRestaurantId] = useState('all');
  const [cuisine, setCuisine] = useState('all');
  const [sort, setSort] = useState('rating');

  const restaurantOptions = useMemo(
    () => [...data.restaurants].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [data.restaurants]
  );

  const filtered = useMemo(() => {
    let list = [...data.meals];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((m) => m.name && m.name.toLowerCase().includes(q));
    if (restaurantId !== 'all') {
      list = list.filter((m) => String(m.restaurantId) === String(restaurantId));
    }
    if (cuisine !== 'all') {
      list = list.filter((m) => m.cuisine === cuisine);
    }

    if (sort === 'rating') {
      list.sort((a, b) => data.mealAverage(b.id) - data.mealAverage(a.id));
    } else if (sort === 'recent') {
      list.sort((a, b) => Number(b.id) - Number(a.id));
    } else if (sort === 'price-asc') {
      list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else if (sort === 'price-desc') {
      list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    } else if (sort === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return list;
  }, [data.meals, search, restaurantId, cuisine, sort, data]);

  function clear() {
    setSearch('');
    setRestaurantId('all');
    setCuisine('all');
    setSort('rating');
  }

  return (
    <main className="page">
      <div className="container">
        <header className="page-header">
          <div className="page-header__text">
            <p className="eyebrow">Dishes</p>
            <h1>Meals</h1>
            <p>Browse, search, and rate the dishes you've enjoyed.</p>
          </div>
          <div className="page-header__actions">
            <Button to="/meals/new" variant="primary">Add meal</Button>
          </div>
        </header>

        <SearchFilterBar
          search={search}
          onSearch={setSearch}
          onClear={clear}
          placeholder="Search by meal name…"
          filters={[
            {
              name: 'restaurant',
              label: 'Restaurant',
              value: restaurantId,
              onChange: setRestaurantId,
              options: [
                { value: 'all', label: 'All restaurants' },
                ...restaurantOptions.map((r) => ({ value: String(r.id), label: r.name })),
              ],
            },
            {
              name: 'cuisine',
              label: 'Cuisine',
              value: cuisine,
              onChange: setCuisine,
              options: [
                { value: 'all', label: 'All cuisines' },
                ...CUISINES.map((c) => ({ value: c, label: c })),
              ],
            },
          ]}
          sort={{
            value: sort,
            defaultValue: 'rating',
            onChange: setSort,
            options: SORT_OPTIONS,
          }}
        />

        {filtered.length ? (
          <div className="grid grid-auto">
            {filtered.map((m) => (
              <MealCard key={m.id} meal={m} />
            ))}
          </div>
        ) : data.meals.length === 0 ? (
          <EmptyState
            title="No meals yet"
            body="Add a meal to start tracking dishes."
            action={<Button to="/meals/new" variant="primary">Add meal</Button>}
          />
        ) : (
          <EmptyState
            title="No meals match your filters"
            body="Try clearing a filter."
            action={<Button onClick={clear} variant="secondary">Clear filters</Button>}
          />
        )}
      </div>
    </main>
  );
}
