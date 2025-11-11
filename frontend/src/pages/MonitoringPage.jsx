import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { Navigate } from 'react-router-dom';

/**
 * MonitoringPage - Performance monitoring dashboard for tech support users
 * Displays system health metrics, uptime, proof generation times, queue depth, and approval rates
 */
export default function MonitoringPage() {
  const { user } = useAuth();
  const [approvalRateDays, setApprovalRateDays] = useState(7);

  // Redirect if user is not tech_support
  if (user?.role !== 'tech_support') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Performance Monitoring</h1>
        <p className="text-muted-foreground mt-1">
          Monitor system health, performance metrics, and operational statistics
        </p>
      </div>

      {/* Performance Dashboard */}
      <PerformanceDashboard
        approvalRateDays={approvalRateDays}
        onApprovalRateDaysChange={setApprovalRateDays}
      />
    </div>
  );
}

