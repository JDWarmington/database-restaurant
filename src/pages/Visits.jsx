import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import VisitCard from '../components/VisitCard.jsx';
import SearchFilterBar from '../components/SearchFilterBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Button from '../components/Button.jsx';

export default function Visits() {
  const data = useData();
  const visits = data.userVisits;

  const [search, setSearch] = useState('');
  const [restaurantId, setRestaurantId] = useState('all');

  const restaurantOptions = useMemo(() => {
    const ids = new Set(visits.map((v) => v.restaurantId));
    return [...ids]
      .map((id) => data.findRestaurant(id))
      .filter(Boolean)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [visits, data]);

  const filtered = useMemo(() => {
    let list = [...visits];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((v) => {
        const r = data.findRestaurant(v.restaurantId);
        return r && r.name && r.name.toLowerCase().includes(q);
      });
    }
    if (restaurantId !== 'all') {
      list = list.filter((v) => String(v.restaurantId) === String(restaurantId));
    }
    return list;
  }, [visits, search, restaurantId, data]);

  function clear() {
    setSearch('');
    setRestaurantId('all');
  }

  return (
    <main className="page">
      <div className="container">
        <header className="page-header">
          <div className="page-header__text">
            <p className="eyebrow">Your experiences</p>
            <h1>Visits</h1>
            <p>Browse your full visit history.</p>
          </div>
          <div className="page-header__actions">
            <Button to="/visits/new" variant="primary">Log visit</Button>
          </div>
        </header>

        <SearchFilterBar
          search={search}
          onSearch={setSearch}
          onClear={clear}
          placeholder="Search by restaurant…"
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
          ]}
        />

        {filtered.length ? (
          <div className="grid grid-auto">
            {filtered.map((v) => (
              <VisitCard key={v.id} visit={v} />
            ))}
          </div>
        ) : visits.length === 0 ? (
          <EmptyState
            title="No visits yet"
            body="Log your first visit to start your dining journal."
            action={<Button to="/visits/new" variant="primary">Log visit</Button>}
          />
        ) : (
          <EmptyState
            title="No visits match your filter"
            body="Try clearing the filter."
            action={<Button onClick={clear} variant="secondary">Clear filters</Button>}
          />
        )}
      </div>
    </main>
  );
}
