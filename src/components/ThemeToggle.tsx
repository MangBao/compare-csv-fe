import { Moon, Sun, Monitor } from '@phosphor-icons/react';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg shadow-inner border border-zinc-200 dark:border-zinc-700/50 relative overflow-hidden group">
      <button
        onClick={() => setTheme('light')}
        className={`relative z-10 p-1.5 rounded-md transition-all duration-300 ${
          theme === 'light' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/30'
        }`}
        title="Light Mode"
      >
        <Sun weight={theme === 'light' ? 'fill' : 'regular'} className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`relative z-10 p-1.5 rounded-md transition-all duration-300 ${
          theme === 'system' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/30'
        }`}
        title="System Preference"
      >
        <Monitor weight={theme === 'system' ? 'fill' : 'regular'} className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`relative z-10 p-1.5 rounded-md transition-all duration-300 ${
          theme === 'dark' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/30'
        }`}
        title="Dark Mode"
      >
        <Moon weight={theme === 'dark' ? 'fill' : 'regular'} className="w-4 h-4" />
      </button>
      
      {/* Background slider animation element (pseudo) */}
      <div 
        className="absolute inset-y-1 w-8 bg-white dark:bg-zinc-700 rounded-md shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0" 
        style={{
          transform: `translateX(${theme === 'light' ? '4px' : theme === 'system' ? '36px' : '68px'})`
        }}
      />
    </div>
  );
}
