import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdvertiserDashboard from '@/components/AdvertiserDashboard';

/**
 * Dashboard component - only accessible to advertisers
 * Non-advertisers are redirected to their respective main pages
 */
export default function Dashboard() {
  const { user } = useAuth();

  // Redirect non-advertisers to their main page
  if (user?.role === 'campaign_manager') {
    return <Navigate to="/approval-queue" replace />;
  }

  if (user?.role === 'tech_support') {
    return <Navigate to="/monitoring" replace />;
  }

  // Only advertisers can access dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.full_name}</p>
      </div>
      <AdvertiserDashboard />
    </div>
  );
}

