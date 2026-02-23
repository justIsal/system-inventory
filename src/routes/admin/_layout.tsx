import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { isAuthenticated, logout, getUserRole, clearAuth } from '@/utils/auth';
import { toast } from 'sonner';
import {
  User,
  Settings,
  LayoutDashboard,
  ShieldAlert,
  PackageSearch,
  Truck,
  Warehouse,
  UserCog,
  ShoppingBag,
  ClipboardCheck,
  ReceiptText,
  Navigation,
  ShieldCheck,
  FileBarChart,
} from 'lucide-react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';

export const Route = createFileRoute('/admin/_layout')({
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      clearAuth();
      throw redirect({ to: '/admin/login' });
    }
    const role = getUserRole();
    if (role === 'staff_gudang') {
      throw redirect({ to: '/staff' as any });
    } else if (role !== 'admin') {
      clearAuth();
      throw redirect({ to: '/admin/login' });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();

  const SIDEBAR_MENU = [
    {
      items: [
        {
          name: 'Dashboard',
          path: '/admin',
          icon: <LayoutDashboard className="h-[18px] w-[18px]" />,
        },
      ],
    },
    {
      label: 'BASIS DATA MASTER',
      items: [
        {
          name: 'Katalog Produk',
          path: '/admin/katalog-produk',
          icon: <PackageSearch className="h-[18px] w-[18px]" />,
        },
        {
          name: 'Direktori Supplier',
          path: '/admin/direktori-supplier',
          icon: <Truck className="h-[18px] w-[18px]" />,
        },
        {
          name: 'Manajemen Gudang',
          path: '/admin/manajemen-gudang',
          icon: <Warehouse className="h-[18px] w-[18px]" />,
        },
        {
          name: 'Manajemen Pengguna',
          path: '/admin/manajemen-pengguna',
          icon: <UserCog className="h-[18px] w-[18px]" />,
        },
      ],
    },
    {
      label: 'PENGADAAN BARANG',
      items: [
        {
          name: 'Pesanan Pembelian',
          path: '/admin/pesanan-pembelian',
          icon: <ShoppingBag className="h-[18px] w-[18px]" />,
        },
        {
          name: 'Kontrol Penerimaan',
          path: '/admin/kontrol-penerimaan',
          icon: <ClipboardCheck className="h-[18px] w-[18px]" />,
        },
      ],
    },
    {
      label: 'DISTRIBUSI BARANG',
      items: [
        {
          name: 'Pesanan Penjualan',
          path: '/admin/pesanan-penjualan',
          icon: <ReceiptText className="h-[18px] w-[18px]" />,
        },
        {
          name: 'Pelacakan Kiriman',
          path: '/admin/pelacakan-kiriman',
          icon: <Navigation className="h-[18px] w-[18px]" />,
        },
      ],
    },
    {
      label: 'KONTROL & AUDIT',
      items: [
        {
          name: 'Pusat Persetujuan',
          path: '/admin/pusat-persetujuan',
          icon: <ShieldCheck className="h-[18px] w-[18px]" />,
        },
        {
          name: 'Analitik & Laporan',
          path: '/admin/analitik-laporan',
          icon: <FileBarChart className="h-[18px] w-[18px]" />,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    toast.info('Berhasil logout dari Admin Portal');
    navigate({ to: '/admin/login' as any });
  };

  return (
    <DashboardLayout
      theme="admin"
      sidebarTitle="ADMIN"
      sidebarSubtitle="Management"
      sidebarMenu={SIDEBAR_MENU}
      baseRoute="/admin"
      headerTitle="Administrator Console"
      userInitials="A"
      userName="Admin User"
      userRole="System Manager"
      dropdownItems={[
        { name: 'Profile', path: '/admin/profile', icon: <User className="h-6 w-6" /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings className="h-6 w-6" /> },
      ]}
      onLogout={handleLogout}
      logoutIcon={<ShieldAlert className="h-12 w-12 text-red-500 mb-4" />}
      logoutTitle="Confirm Logout"
      logoutDescription="Are you sure you want to end your admin session?"
      logoutWarningText="You will be required to sign in again to access the administrator console."
      logoutConfirmText="Yes, Logout"
    />
  );
}
