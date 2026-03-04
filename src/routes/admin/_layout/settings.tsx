import { createFileRoute } from '@tanstack/react-router';
import { useTheme } from '@/contexts/themeHooks';
import { Moon, Sun, Monitor, Bell, Shield, Database } from 'lucide-react';

export const Route = createFileRoute('/admin/_layout/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          System Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Configure global platform metrics and interface preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium rounded-lg text-left">
            <Monitor className="h-5 w-5" />
            Appearance
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium rounded-lg text-left transition-colors">
            <Bell className="h-5 w-5" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium rounded-lg text-left transition-colors">
            <Shield className="h-5 w-5" />
            Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium rounded-lg text-left transition-colors">
            <Database className="h-5 w-5" />
            Data Backups
          </button>
        </div>

        {/* Settings Content */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6 transition-colors">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                Theme Preferences
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose how the Admin Portal looks to you. This setting only applies to your browser
                session.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Light Theme Option */}
              <button
                onClick={() => setTheme('light')}
                className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-slate-500'
                }`}
              >
                <div className="p-3 bg-white border border-slate-200 rounded-full shadow-sm mb-3">
                  <Sun className="h-6 w-6 text-amber-500" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Light Mode</span>
                {theme === 'light' && (
                  <div className="absolute top-3 right-3 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-blue-100 dark:ring-blue-900/40"></div>
                )}
              </button>

              {/* Dark Theme Option */}
              <button
                onClick={() => setTheme('dark')}
                className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-slate-700'
                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <div className="p-3 bg-slate-800 border border-slate-700 rounded-full shadow-sm mb-3">
                  <Moon className="h-6 w-6 text-slate-300" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Dark Mode</span>
                {theme === 'dark' && (
                  <div className="absolute top-3 right-3 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-blue-100 dark:ring-blue-900/40"></div>
                )}
              </button>

              {/* System Option Placeholder */}
              <button className="relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 opacity-50 cursor-not-allowed">
                <div className="p-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full shadow-sm mb-3">
                  <Monitor className="h-6 w-6 text-slate-400" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Sync with System
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                  Coming Soon
                </span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Dashboard Configuration
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                <div>
                  <div className="font-semibold text-slate-700 dark:text-slate-200">
                    Compact Table View
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Reduce padding in data tables to show more rows.
                  </div>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 dark:bg-slate-600 cursor-not-allowed">
                  <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition"></span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
