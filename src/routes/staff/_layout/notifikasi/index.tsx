import { createFileRoute } from '@tanstack/react-router';
import { NotifikasiPage } from '@/components/templates/NotifikasiPage';

export const Route = createFileRoute('/staff/_layout/notifikasi/')({
  component: NotifikasiPage,
});
