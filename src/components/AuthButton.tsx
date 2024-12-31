import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut } from 'lucide-react';

export default function AuthButton() {
  const { user, signInWithGoogle, logout } = useAuth();

  return user ? (
    <div className="flex items-center gap-3">
      <span className="text-sm dark:text-gray-300">{user.displayName}</span>
      <button
        onClick={logout}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  ) : (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
    >
      <LogIn size={16} />
      Sign in with Google
    </button>
  );
}