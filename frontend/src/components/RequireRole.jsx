import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * RequireRole component - HOC for role-based route protection
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if role is allowed
 * @param {string[]} props.allowedRoles - Array of allowed roles (e.g., ['advertiser', 'campaign_manager'])
 */
export function RequireRole({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to role-appropriate main page
    const redirectPath =
      user.role === 'campaign_manager'
        ? '/approval-queue'
        : user.role === 'tech_support'
        ? '/monitoring'
        : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

