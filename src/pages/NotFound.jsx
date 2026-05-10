import EmptyState from '../components/EmptyState.jsx';
import Button from '../components/Button.jsx';

export default function NotFound() {
  return (
    <main className="page">
      <div className="container">
        <EmptyState
          title="Page not found"
          body="That page isn't on the menu. Try heading back to your dashboard."
          action={<Button to="/dashboard" variant="primary">Back to dashboard</Button>}
        />
      </div>
    </main>
  );
}
