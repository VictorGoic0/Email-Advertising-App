import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils.js';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              {/* Desktop Navigation Links */}
              {navigationLinks.length > 0 && (
                <nav className="hidden md:flex items-center gap-1">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={cn(
                        'px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                        isActive(link.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                      aria-current={isActive(link.path) ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              )}

              {/* Mobile Menu Button */}
              {navigationLinks.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="User menu"
                  >
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
                  <DropdownMenuItem 
                    onClick={logout} 
                    className="text-destructive cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && navigationLinks.length > 0 && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Menu Panel */}
          <nav
            className="fixed top-16 left-0 right-0 bg-white border-b border-border shadow-lg z-50 md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-4 py-3 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    isActive(link.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  aria-current={isActive(link.path) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

