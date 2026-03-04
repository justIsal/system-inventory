import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/manajemen-pengguna/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6 mx-auto pb-10">
      <Breadcrumbs
        items={[{ label: 'Dashboard', path: '/admin' }, { label: 'Manajemen Pengguna' }]}
        className="mb-8"
      />
    </div>
  );
}
