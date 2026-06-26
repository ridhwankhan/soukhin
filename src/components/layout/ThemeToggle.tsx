import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="p-2 hover:bg-surface rounded-full transition-colors"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-ink" />
      ) : (
        <Sun className="w-5 h-5 text-accent" />
      )}
    </button>
  );
}
