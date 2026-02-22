import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-gray-500 mt-1">Configure global platform metrics.</p>
      </div>
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center text-gray-500">
         Settings form coming soon
      </div>
    </div>
  );
}
