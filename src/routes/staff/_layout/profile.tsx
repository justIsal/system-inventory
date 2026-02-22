import { createFileRoute } from '@tanstack/react-router';
import { ProfileForm } from '@/components/organisms/ProfileForm';

export const Route = createFileRoute('/staff/_layout/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Profile</h1>
        <p className="text-gray-500 mt-1">View your assigned operational warehouse and update credentials.</p>
      </div>
      <ProfileForm />
    </div>
  );
}
