import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="p-2 hover:bg-[#F5F0E8] dark:hover:bg-white/10 rounded-full transition-colors"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-[#2D2D2D] dark:text-white/90" />
      ) : (
        <Sun className="w-5 h-5 text-[#2D2D2D] dark:text-white/90" />
      )}
    </button>
  );
}
