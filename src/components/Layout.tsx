import { Outlet } from 'react-router-dom';
import { Vote } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vote size={24} className="text-blue-500" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Web Opinion</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <ProfileDropdown />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
