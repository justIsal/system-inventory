import { createFileRoute } from '@tanstack/react-router';
import { NotifikasiPage } from '@/components/templates/NotifikasiPage';

export const Route = createFileRoute('/admin/_layout/notifikasi/')({
  component: NotifikasiPage,
});
