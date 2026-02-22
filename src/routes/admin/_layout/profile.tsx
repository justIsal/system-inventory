import { createFileRoute } from '@tanstack/react-router';
import { ProfileForm } from '@/components/organisms/ProfileForm';

export const Route = createFileRoute('/admin/_layout/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Profile</h1>
        <p className="text-gray-500 mt-1">Manage your administrator account credentials.</p>
      </div>
      <ProfileForm />
    </div>
  );
}
