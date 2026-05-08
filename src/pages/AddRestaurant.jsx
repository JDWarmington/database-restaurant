import { useNavigate } from 'react-router-dom';
import RestaurantForm from './RestaurantForm.jsx';
import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function AddRestaurant() {
  const { addRestaurant } = useData();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleSubmit(values) {
    const result = await addRestaurant(values);
    if (result.ok) {
      toast.success(`${result.restaurant.name} added`);
      navigate(`/restaurants/${result.restaurant.id}`, { replace: true });
    }
    return result;
  }

  return (
    <main className="page">
      <div className="container">
        <div className="form-card">
          <p className="eyebrow">New entry</p>
          <h1 className="form-card__title">Add restaurant</h1>
          <p className="form-card__subtitle">
            Save a new place. You can log visits, add meals, and rate it later.
          </p>
        </div>
        <RestaurantForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel="Save Restaurant"
        />
      </div>
    </main>
  );
}
