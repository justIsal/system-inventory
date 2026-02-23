import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { isAuthenticated, logout, getUserRole, clearAuth } from '@/utils/auth';
import { toast } from 'sonner';
import {
  User,
  Building2,
  LayoutDashboard,
  DoorOpen,
  PackagePlus,
  ClipboardList,
  Box,
  ScanBarcode,
  ArrowRightLeft,
  FileEdit,
  History,
} from 'lucide-react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';

export const Route = createFileRoute('/staff/_layout')({
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      clearAuth();
      throw redirect({ to: '/staff/login' as any });
    }
    const role = getUserRole();
    if (role === 'admin') {
      throw redirect({ to: '/admin' as any });
    } else if (role !== 'staff_gudang') {
      clearAuth();
      throw redirect({ to: '/staff/login' as any });
    }
  },
  component: StaffLayout,
});

function StaffLayout() {
  const navigate = useNavigate();

  const SIDEBAR_MENU = [
    {
      items: [{ name: 'Dashboard', path: '/staff', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> }],
    },
    {
      label: 'LOGISTIK MASUK',
      items: [
        {
          name: 'Penerimaan barang',
          path: '/staff/inbound',
          icon: <PackagePlus className="h-[18px] w-[18px]" />,
        },
      ],
    },
    {
      label: 'LOGISTIK KELUAR',
      items: [
        {
          name: 'Daftar Ambil (Picking)',
          path: '/staff/picking',
          icon: <ClipboardList className="h-[18px] w-[18px]" />,
        },
        { name: 'Packing & Manifest', path: '/staff/packing', icon: <Box className="h-[18px] w-[18px]" /> },
      ],
    },
    {
      label: 'MANAJEMEN STOK',
      items: [
        {
          name: 'Cek & Pindai Stok',
          path: '/staff/scan',
          icon: <ScanBarcode className="h-[18px] w-[18px]" />,
        },
        {
          name: 'Relokasi Produk',
          path: '/staff/relocation',
          icon: <ArrowRightLeft className="h-[18px] w-[18px]" />,
        },
        {
          name: 'Pengajuan Koreksi',
          path: '/staff/correction',
          icon: <FileEdit className="h-[18px] w-[18px]" />,
        },
      ],
    },
    {
      label: 'KONTROL & AUDIT',
      items: [
        {
          name: 'Riwayat Operasional',
          path: '/staff/history',
          icon: <History className="h-[18px] w-[18px]" />,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    toast.info('Berhasil logout dari Staff Portal');
    navigate({ to: '/staff/login' as any });
  };

  return (
    <DashboardLayout
      theme="staff"
      sidebarTitle="asdfasdf"
      sidebarMenu={SIDEBAR_MENU}
      baseRoute="/staff"
      headerTitle="Staff Dashboard"
      userInitials="S"
      userName="Staff User"
      userRole="Warehouse Operator"
      dropdownItems={[
        { name: 'Profile', path: '/staff/profile', icon: <User className="h-4 w-4" /> },
        { name: 'Gudang', path: '/staff/gudang', icon: <Building2 className="h-4 w-4" /> },
      ]}
      onLogout={handleLogout}
      logoutIcon={<DoorOpen className="h-12 w-12 text-red-500 mb-4" />}
      logoutTitle="Sign Out"
      logoutDescription="Are you sure you want to end your current staff shift?"
      logoutWarningText="Please make sure all ongoing operations are saved."
      logoutConfirmText="Sign Out"
    />
  );
}
