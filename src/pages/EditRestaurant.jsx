import { useNavigate, useParams } from 'react-router-dom';
import RestaurantForm from './RestaurantForm.jsx';
import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Button from '../components/Button.jsx';

export default function EditRestaurant() {
  const { id } = useParams();
  const data = useData();
  const restaurant = data.findRestaurant(id);
  const toast = useToast();
  const navigate = useNavigate();

  if (!restaurant) {
    return (
      <main className="page">
        <div className="container">
          <EmptyState
            title="Restaurant not found"
            body="It may have been removed."
            action={<Button to="/restaurants" variant="primary">Back to restaurants</Button>}
          />
        </div>
      </main>
    );
  }

  async function handleSubmit(values) {
    const result = await data.updateRestaurant(id, values);
    if (result.ok) {
      toast.success('Restaurant updated');
      navigate(`/restaurants/${id}`, { replace: true });
    }
    return result;
  }

  return (
    <main className="page">
      <div className="container">
        <div className="form-card">
          <p className="eyebrow">Editing</p>
          <h1 className="form-card__title">{restaurant.name}</h1>
          <p className="form-card__subtitle">Update the details for this restaurant.</p>
        </div>
        <RestaurantForm
          initial={restaurant}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel="Save changes"
        />
      </div>
    </main>
  );
}
