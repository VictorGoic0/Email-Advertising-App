import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getRoleDisplayName = (role) => {
    const roleMap = {
      advertiser: 'Advertiser',
      campaign_manager: 'Campaign Manager',
      tech_support: 'Tech Support',
    };
    return roleMap[role] || role;
  };

  // Navigation links based on role
  const getNavigationLinks = () => {
    if (!user) return [];

    const links = [];

    if (user.role === 'advertiser') {
      links.push(
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/campaigns', label: 'My Campaigns' },
        { path: '/assets', label: 'Upload Assets' }
      );
    } else if (user.role === 'campaign_manager') {
      links.push({ path: '/approval-queue', label: 'Approval Queue' });
    } else if (user.role === 'tech_support') {
      links.push({ path: '/monitoring', label: 'Monitoring Dashboard' });
    }

    return links;
  };

  const navigationLinks = getNavigationLinks();

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to={user?.role === 'advertiser' ? '/dashboard' : user?.role === 'campaign_manager' ? '/approval-queue' : '/monitoring'} className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
              <img 
                src="/logo.svg" 
                alt="Email Advertising Generator" 
                className="h-8 w-8"
              />
              <h1 className="text-xl font-bold text-foreground">Email Advertising Generator</h1>
            </Link>
            
            <div className="flex items-center gap-4">
              {/* Navigation Links */}
              {navigationLinks.length > 0 && (
                <nav className="hidden md:flex items-center gap-1">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={cn(
                        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActive(link.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user?.full_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">{getRoleDisplayName(user?.role)}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

