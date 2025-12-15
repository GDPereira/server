import { useAuth } from '../contexts/auth-context';
import { Dashboard as DashboardContent } from '../components/Dashboard';
import { Button } from '../components/ui/button';

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <span className="text-gray-600">
            Logged in as <strong>{user?.email}</strong>
          </span>
          <Button variant="outline" onClick={logout}>
            Sign out
          </Button>
        </div>
      </header>
      <DashboardContent />
    </div>
  );
}
