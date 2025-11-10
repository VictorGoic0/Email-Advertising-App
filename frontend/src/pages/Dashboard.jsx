import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.full_name}</p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
              <CardDescription>Manage your email campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Create and manage your email advertising campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assets</CardTitle>
              <CardDescription>Upload and organize assets</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage logos, images, copy, and URLs</p>
            </CardContent>
          </Card>

          {user?.role === 'campaign_manager' && (
            <Card>
              <CardHeader>
                <CardTitle>Approval Queue</CardTitle>
                <CardDescription>Review pending campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Review and approve campaigns</p>
              </CardContent>
            </Card>
          )}

          {user?.role === 'tech_support' && (
            <Card>
              <CardHeader>
                <CardTitle>Metrics</CardTitle>
                <CardDescription>System performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">View system health and metrics</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

