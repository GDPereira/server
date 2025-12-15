import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { SignupForm } from '../components/auth/signup-form';

export function SignupPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Create your account
        </h1>
        <SignupForm />
      </div>
    </div>
  );
}
