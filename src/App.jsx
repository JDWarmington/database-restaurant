import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Restaurants from './pages/Restaurants.jsx';
import RestaurantDetail from './pages/RestaurantDetail.jsx';
import AddRestaurant from './pages/AddRestaurant.jsx';
import EditRestaurant from './pages/EditRestaurant.jsx';
import Visits from './pages/Visits.jsx';
import LogVisit from './pages/LogVisit.jsx';
import VisitDetail from './pages/VisitDetail.jsx';
import Meals from './pages/Meals.jsx';
import MealDetail from './pages/MealDetail.jsx';
import AddMeal from './pages/AddMeal.jsx';
import RestaurantRatingForm from './pages/RestaurantRatingForm.jsx';
import MealRatingForm from './pages/MealRatingForm.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Recommendations from './pages/Recommendations.jsx';
import MediaGallery from './pages/MediaGallery.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <>
        <Navbar />
        {children}
      </>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />

      <Route path="/restaurants" element={<Protected><Restaurants /></Protected>} />
      <Route path="/restaurants/new" element={<Protected><AddRestaurant /></Protected>} />
      <Route path="/restaurants/:id" element={<Protected><RestaurantDetail /></Protected>} />
      <Route path="/restaurants/:id/edit" element={<Protected><EditRestaurant /></Protected>} />

      <Route path="/visits" element={<Protected><Visits /></Protected>} />
      <Route path="/visits/new" element={<Protected><LogVisit /></Protected>} />
      <Route path="/visits/:id" element={<Protected><VisitDetail /></Protected>} />

      <Route path="/meals" element={<Protected><Meals /></Protected>} />
      <Route path="/meals/new" element={<Protected><AddMeal /></Protected>} />
      <Route path="/meals/:id" element={<Protected><MealDetail /></Protected>} />

      <Route path="/ratings/restaurant/new" element={<Protected><RestaurantRatingForm /></Protected>} />
      <Route path="/ratings/meal/new" element={<Protected><MealRatingForm /></Protected>} />

      <Route path="/wishlist" element={<Protected><Wishlist /></Protected>} />
      <Route path="/recommendations" element={<Protected><Recommendations /></Protected>} />
      <Route path="/gallery" element={<Protected><MediaGallery /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />

      <Route path="*" element={<Protected><NotFound /></Protected>} />
    </Routes>
  );
}
