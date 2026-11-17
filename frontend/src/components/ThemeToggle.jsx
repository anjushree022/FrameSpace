import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-full p-2.5 text-ink/80 transition-colors hover:bg-sand hover:text-ink"
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
