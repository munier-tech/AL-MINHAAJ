import React from 'react';
import ThemeToggle from './ThemeToggle';
import useThemeStore from '../store/themeStore';

const ThemeDemo = () => {
  const { theme } = useThemeStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Theme Demo
            </h1>
            <ThemeToggle />
          </div>
          
          <div className="mb-6">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              Current theme: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{theme}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Color Palette Demo */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Color Palette</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-900 dark:text-white font-medium">Background</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">gray-100 / gray-700</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-gray-900 dark:text-white font-medium">Card</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">white / gray-800</p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-lg">
                  <p className="text-indigo-900 dark:text-indigo-100 font-medium">Primary</p>
                  <p className="text-indigo-600 dark:text-indigo-300 text-sm">indigo-100 / indigo-900</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                  <p className="text-green-900 dark:text-green-100 font-medium">Success</p>
                  <p className="text-green-600 dark:text-green-300 text-sm">green-100 / green-900</p>
                </div>
              </div>
            </div>

            {/* Text Colors Demo */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Text Colors</h2>
              <div className="space-y-2">
                <p className="text-gray-900 dark:text-white font-medium">Primary Text</p>
                <p className="text-gray-700 dark:text-gray-300">Secondary Text</p>
                <p className="text-gray-500 dark:text-gray-400">Muted Text</p>
                <p className="text-indigo-600 dark:text-indigo-400">Link Text</p>
                <p className="text-green-600 dark:text-green-400">Success Text</p>
                <p className="text-red-600 dark:text-red-400">Error Text</p>
              </div>
            </div>
          </div>

          {/* Interactive Elements */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Interactive Elements</h2>
            <div className="flex flex-wrap gap-4">
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg transition-colors">
                Primary Button
              </button>
              <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors">
                Secondary Button
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
                Outline Button
              </button>
            </div>
          </div>

          {/* Form Elements */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Form Elements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Input Field
                </label>
                <input 
                  type="text" 
                  placeholder="Enter text here..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Dropdown
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;