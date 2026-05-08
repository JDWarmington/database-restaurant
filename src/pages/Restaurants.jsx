import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import RestaurantCard from '../components/RestaurantCard.jsx';
import SearchFilterBar from '../components/SearchFilterBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Button from '../components/Button.jsx';

const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'recent', label: 'Most recent' },
];

export default function Restaurants() {
  const data = useData();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');

  const filtered = useMemo(() => {
    let list = [...data.restaurants];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.address && r.address.toLowerCase().includes(q))
      );
    }
    if (sort === 'rating') {
      list.sort((a, b) => data.restaurantAverage(b.id) - data.restaurantAverage(a.id));
    } else if (sort === 'recent') {
      list.sort((a, b) => Number(b.id) - Number(a.id));
    } else {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return list;
  }, [data.restaurants, search, sort, data]);

  function clear() {
    setSearch('');
    setSort('name');
  }

  return (
    <main className="page">
      <div className="container">
        <header className="page-header">
          <div className="page-header__text">
            <p className="eyebrow">Your places</p>
            <h1>Restaurants</h1>
            <p>Search and revisit every spot in your dining journal.</p>
          </div>
          <div className="page-header__actions">
            <Button to="/restaurants/new" variant="primary">Add restaurant</Button>
          </div>
        </header>

        <SearchFilterBar
          search={search}
          onSearch={setSearch}
          onClear={clear}
          placeholder="Search by name or address…"
          sort={{
            value: sort,
            defaultValue: 'name',
            onChange: setSort,
            options: SORT_OPTIONS,
          }}
        />

        {filtered.length ? (
          <div className="grid grid-auto">
            {filtered.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        ) : data.restaurants.length === 0 ? (
          <EmptyState
            title="No restaurants yet"
            body="Start your dining journal by adding your first restaurant."
            action={<Button to="/restaurants/new" variant="primary">Add restaurant</Button>}
          />
        ) : (
          <EmptyState
            title="No restaurants match your search"
            body="Try clearing the filter or searching for something else."
            action={<Button onClick={clear} variant="secondary">Clear filters</Button>}
          />
        )}
      </div>
    </main>
  );
}
