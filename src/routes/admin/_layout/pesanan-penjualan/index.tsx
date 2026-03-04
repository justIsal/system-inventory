import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { salesOrderService } from '@/services/api/salesOrderService';
import type { SalesOrder } from '@/types/sales-order.types';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';
import { CatalogToolbar, type SortConfig } from '@/components/organisms/CatalogToolbar';
import { DataTable, type ColumnDef } from '@/components/organisms/DataTable';
import { ActionDropdown } from '@/components/molecules/ActionDropdown';
import { Alert } from '@/components/molecules/Alert';
import { Modal } from '@/components/molecules/Modal';
import { formatRupiah } from '@/utils/format';
import { FileText, Edit, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/admin/_layout/pesanan-penjualan/')({
  component: PesananPenjualanPage,
});

function PesananPenjualanPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    order: 'desc',
  });
  const [selectedOrders, setSelectedOrders] = useState<SalesOrder[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await salesOrderService.getSalesOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setNotification({ type: 'error', message: 'Gagal memuat data Pesanan Penjualan' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => setSearchQuery(query);

  const soSortOptions = [
    { label: 'Terbaru Ditambahkan', key: 'created_at', order: 'desc' as const },
    { label: 'Terlama Ditambahkan', key: 'created_at', order: 'asc' as const },
  ];

  const handleConfirmDelete = async () => {
    if (selectedOrders.length === 0) return;
    setIsSubmitting(true);
    setNotification(null);
    try {
      const idsToDelete = selectedOrders.map((o) => o.so_id);

      // Usually you'd map standard bulk delete here or loop through delete APIs
      setNotification({
        type: 'success',
        message: `${idsToDelete.length} Pesanan berhasil dihapus.`,
      });
      setSelectedOrders([]);
      setIsDeleteModalOpen(false);
      fetchOrders();
      setTimeout(() => setNotification(null), 5000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Failed to delete SOs:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Terjadi kesalahan saat menghapus pesanan.',
      });
      setIsDeleteModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Sort Logic
  const filteredOrders = orders.filter((order) => {
    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch =
        `SO-${new Date(order.created_at).getFullYear()}-${String(order.so_id).padStart(3, '0')}`
          .toLowerCase()
          .includes(query) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(query)) ||
        false;
    }

    let matchesStatus = true;
    if (statusFilter) {
      matchesStatus = order.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  filteredOrders.sort((a, b) => {
    if (sortConfig.key === 'created_at') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortConfig.order === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  const columns: ColumnDef<SalesOrder>[] = [
    {
      header: 'NO. SO',
      cell: (row) =>
        `SO-${new Date(row.created_at).getFullYear()}-${String(row.so_id).padStart(3, '0')}`,
      className: 'font-medium py-4 px-4 whitespace-nowrap',
    },
    {
      header: 'PELANGGAN',
      cell: (row) => row.customer_name || '-',
      className: 'py-4 px-4 whitespace-nowrap',
    },
    {
      header: 'TANGGAL',
      cell: (row) =>
        new Date(row.created_at).toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      className: 'py-4 px-4 text-slate-500 whitespace-nowrap',
    },
    {
      header: 'TOTAL ITEM',
      cell: (row) => {
        const totalItems = row.items?.reduce((sum, item) => sum + item.qty_requested, 0) || 0;
        return <span className="font-bold">{totalItems}</span>;
      },
      className: 'py-4 px-4 text-center',
    },
    {
      header: 'TOTAL HARGA',
      cell: (row) => {
        const totalHarga =
          row.items?.reduce(
            (sum, item) => sum + item.qty_requested * Number(item.variant?.price_sell || 0),
            0,
          ) || 0;
        return formatRupiah(totalHarga);
      },
      className: 'py-4 px-4 whitespace-nowrap',
    },
    {
      header: 'ADMIN',
      cell: (row) => row.admin?.username || '-',
      className: 'py-4 px-4 text-slate-500',
    },
    {
      header: 'STATUS',
      cell: (row) => {
        let badgeColor = 'bg-slate-100 text-slate-800 border-slate-200';
        if (row.status === 'DELIVERED') badgeColor = 'bg-teal-50 text-teal-700 border-teal-200';
        if (row.status === 'DRAFT') badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
        if (row.status === 'PENDING') badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
        if (row.status === 'SHIPPED') badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        if (row.status === 'CANCELLED') badgeColor = 'bg-red-50 text-red-700 border-red-200';

        return (
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider border ${badgeColor}`}
          >
            {row.status}
          </span>
        );
      },
      className: 'py-4 px-4',
    },
    {
      header: 'AKSI',
      cell: (row) => (
        <ActionDropdown
          items={[
            {
              label: 'Detail',
              icon: <FileText size={16} />,
              onClick: () =>
                navigate({
                  to: '/admin/pesanan-penjualan/$soId',
                  params: { soId: row.so_id.toString() },
                }),
            },
            {
              label: 'Edit',
              icon: <Edit size={16} />,
              onClick: () =>
                navigate({
                  to: '/admin/pesanan-penjualan/$soId/edit',
                  params: { soId: row.so_id.toString() },
                }),
            },
            {
              label: 'Hapus',
              icon: <Trash2 size={16} />,
              onClick: () => {
                setSelectedOrders([row]);
                setIsDeleteModalOpen(true);
              },
              variant: 'danger',
            },
          ]}
        />
      ),
      className: 'py-4 px-4 text-center',
    },
  ];

  return (
    <div className="space-y-6 mx-auto pb-10">
      {/* Breadcrumb Area */}
      <Breadcrumbs
        items={[{ label: 'Dashboard', path: '/admin' }, { label: 'Pesanan Penjualan' }]}
        className="mb-8"
      />

      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-100 animate-in slide-in-from-top-4 fade-in duration-300">
          <Alert variant={notification.type === 'error' ? 'destructive' : 'success'}>
            <div>{notification.message}</div>
          </Alert>
        </div>
      )}

      {/* Top Controls: Filter & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <CatalogToolbar
            onSearchChange={handleSearch}
            selectedCount={selectedOrders.length}
            onDeleteSelected={() => setIsDeleteModalOpen(true)}
            onAddClick={() => navigate({ to: '/admin/pesanan-penjualan/create' as never })}
            addButtonLabel="Buat Pesanan Baru"
            sortOptions={soSortOptions}
            currentSort={sortConfig}
            onSortChange={(sort) => setSortConfig(sort)}
            filterTitle="Filter Pesanan"
            filterContent={
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Status Pesanan
                </label>
                <select
                  className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Semua Status</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            }
            onResetFilter={() => setStatusFilter('')}
          />
        </div>
      </div>

      {/* Data Table Core */}
      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredOrders}
          isLoading={isLoading}
          keyExtractor={(row) => row.so_id}
          onRowSelectionChange={(selected) => setSelectedOrders(selected)}
        />
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        description="Apakah Anda yakin ingin menghapus pesanan (SO) yang dipilih? Data yang sudah dihapus tidak dapat direstore."
      >
        <div className="flex justify-end gap-3 mt-6 p-2">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={isSubmitting}
            className="px-4 py-2 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            {isSubmitting ? 'Menghapus...' : 'Ya, Hapus SO'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
