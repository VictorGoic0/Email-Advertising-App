import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.full_name}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
              <CardDescription>Manage your email campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Create and manage your email advertising campaigns</p>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/campaigns">View Campaigns</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/campaigns/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assets</CardTitle>
              <CardDescription>Upload and organize assets</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Manage logos, images, copy, and URLs</p>
              <Button asChild>
                <Link to="/assets">Upload Assets</Link>
              </Button>
            </CardContent>
          </Card>

          {user?.role === 'campaign_manager' && (
            <Card>
              <CardHeader>
                <CardTitle>Approval Queue</CardTitle>
                <CardDescription>Review pending campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Review and approve campaigns</p>
                <Button asChild>
                  <Link to="/approval-queue">View Approval Queue</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {user?.role === 'tech_support' && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Monitoring</CardTitle>
                <CardDescription>System performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Monitor system health and performance</p>
                <Button asChild>
                  <Link to="/monitoring">View Monitoring Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

