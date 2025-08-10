import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../store/themeStore';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center w-12 h-12 rounded-lg
        bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
        transition-all duration-300 ease-in-out shadow-sm hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-800 ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        {/* Sun Icon */}
        <Sun 
          className={`
            absolute inset-0 w-6 h-6 transition-all duration-300 ease-in-out
            ${theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-75'
            }
          `}
        />
        {/* Moon Icon */}
        <Moon 
          className={`
            absolute inset-0 w-6 h-6 transition-all duration-300 ease-in-out
            ${theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-75'
            }
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;