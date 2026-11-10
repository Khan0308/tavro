import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
const current = () => document.documentElement.getAttribute('data-theme') || 'light';
export default function ThemeToggle() {
  const [theme, setTheme] = useState(current);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('TAVRO-theme', theme); } catch (e) { /* storage may be blocked */ }
  }, [theme]);
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button type="button" className="icon-btn" onClick={() => setTheme(next)} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      {theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </button>
  );
}
