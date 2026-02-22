import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/staff/_layout/gudang')({
  component: GudangPage,
});

function GudangPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Warehouse</h1>
        <p className="text-gray-500 mt-1">Overview of your assigned warehouse performance and data.</p>
      </div>
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center text-gray-500">
         Gudang detail metrics coming soon
      </div>
    </div>
  );
}
