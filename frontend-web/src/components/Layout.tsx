import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import { LogOut, Briefcase, FileText, Menu, X, Building2, Key, Sun, Moon } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-primary shadow-theme border-b border-primary">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-secondary hover:text-primary hover:bg-tertiary"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h1 className="text-xl font-semibold text-primary ml-2 lg:ml-0">{String(t('pages.login.title'))}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-secondary hidden sm:block">{String(t('pages.dashboard.welcome', { email: user?.email }))}</span>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-secondary hover:text-primary hover:bg-tertiary transition-colors"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
            
            <button
              onClick={logout}
              className="btn-secondary flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">{String(t('common.logout'))}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary shadow-theme transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:h-screen`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-primary lg:hidden">
            <h2 className="text-lg font-semibold text-primary">{String(t('navigation.dashboard'))}</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-secondary hover:text-primary hover:bg-tertiary"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              <Link
                to="/"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/') 
                    ? 'bg-tertiary text-primary' 
                    : 'text-secondary hover:bg-tertiary hover:text-primary'
                }`}
              >
                <Briefcase className="mr-3 h-5 w-5" />
                {String(t('navigation.dashboard'))}
              </Link>
              
              <Link
                to="/positions"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/positions') 
                    ? 'bg-tertiary text-primary' 
                    : 'text-secondary hover:bg-tertiary hover:text-primary'
                }`}
              >
                <Building2 className="mr-3 h-5 w-5" />
                {String(t('navigation.positions'))}
              </Link>
              
              <Link
                to="/jobs"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/jobs') 
                    ? 'bg-tertiary text-primary' 
                    : 'text-secondary hover:bg-tertiary hover:text-primary'
                }`}
              >
                <Briefcase className="mr-3 h-5 w-5" />
                {String(t('navigation.jobs'))}
              </Link>
              
              <Link
                to="/applications"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/applications') 
                    ? 'bg-tertiary text-primary' 
                    : 'text-secondary hover:bg-tertiary hover:text-primary'
                }`}
              >
                <FileText className="mr-3 h-5 w-5" />
                {String(t('navigation.applications'))}
              </Link>
              
              <Link
                to="/change-password"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/change-password') 
                    ? 'bg-tertiary text-primary' 
                    : 'text-secondary hover:bg-tertiary hover:text-primary'
                }`}
              >
                <Key className="mr-3 h-5 w-5" />
                {String(t('navigation.changePassword'))}
              </Link>
            </div>
          </nav>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
