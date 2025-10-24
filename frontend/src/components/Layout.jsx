import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Home, Search, MapPin, List, LogOut, Moon, Sun } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { authAPI } from '../utils/api';

function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const handleLogout = async () => {
    try {
      // Call logout API to clear httpOnly cookies
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-primary-700 dark:bg-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold">
              Mushroom Hunter
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm">Welcome, {user?.username}</span>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-primary-600 dark:bg-gray-700 hover:bg-primary-500 dark:hover:bg-gray-600 transition-colors"
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 dark:bg-gray-700 hover:bg-primary-500 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg md:hidden">
        <div className="flex justify-around">
          <Link
            to="/"
            className="flex flex-col items-center py-3 px-4 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            to="/species"
            className="flex flex-col items-center py-3 px-4 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <Search size={24} />
            <span className="text-xs mt-1">Species</span>
          </Link>
          <Link
            to="/findings"
            className="flex flex-col items-center py-3 px-4 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <List size={24} />
            <span className="text-xs mt-1">Findings</span>
          </Link>
          <Link
            to="/map"
            className="flex flex-col items-center py-3 px-4 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <MapPin size={24} />
            <span className="text-xs mt-1">Map</span>
          </Link>
        </div>
      </nav>

      {/* Desktop Navigation */}
      <div className="hidden md:block fixed left-0 top-20 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <nav className="space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
          >
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/species"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
          >
            <Search size={20} />
            <span>Species Explorer</span>
          </Link>
          <Link
            to="/findings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
          >
            <List size={20} />
            <span>My Findings</span>
          </Link>
          <Link
            to="/map"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
          >
            <MapPin size={20} />
            <span>Findings Map</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default Layout;
