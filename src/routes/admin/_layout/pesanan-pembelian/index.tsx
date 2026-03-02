import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { purchaseOrderService } from '@/services/api/purchaseOrderService';
import type { PurchaseOrder } from '@/types/purchase-order.types';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';
import { CatalogToolbar } from '@/components/organisms/CatalogToolbar';
import { DataTable, type ColumnDef } from '@/components/organisms/DataTable';
import { ActionDropdown } from '@/components/molecules/ActionDropdown';
import { Alert } from '@/components/molecules/Alert';
import { formatRupiah } from '@/utils/format';
export const Route = createFileRoute('/admin/_layout/pesanan-pembelian/')({
  component: PesananPembelianPage,
});

function PesananPembelianPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOption, setSortOption] = useState('');
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
      const data = await purchaseOrderService.getPurchaseOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setNotification({ type: 'error', message: 'Gagal memuat data Pesanan Pembelian' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => setSearchQuery(query);

  const handleFilter = (filters: Record<string, string>) => {
    setStatusFilter(filters.status || '');
  };

  const handleSort = (option: string) => setSortOption(option);

  // Filter & Sort Logic
  const filteredOrders = orders.filter((order) => {
    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch =
        `PO-${new Date(order.created_at).getFullYear()}-${String(order.po_id).padStart(3, '0')}`
          .toLowerCase()
          .includes(query) ||
        order.supplier?.name.toLowerCase().includes(query) ||
        false;
    }

    let matchesStatus = true;
    if (statusFilter) {
      matchesStatus = order.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  if (sortOption === 'terbaru') {
    filteredOrders.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  } else if (sortOption === 'terlama') {
    filteredOrders.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      header: 'NO. PO',
      cell: (row) =>
        `PO-${new Date(row.created_at).getFullYear()}-${String(row.po_id).padStart(3, '0')}`,
      className: 'font-medium py-4 px-4 whitespace-nowrap',
    },
    {
      header: 'SUPPLIER',
      cell: (row) => row.supplier?.name || '-',
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
        const totalItems = row.items?.reduce((sum, item) => sum + item.qty_ordered, 0) || 0;
        return <span className="font-bold">{totalItems}</span>;
      },
      className: 'py-4 px-4 text-center',
    },
    {
      header: 'TOTAL HARGA',
      cell: (row) => {
        const totalHarga =
          row.items?.reduce(
            (sum, item) => sum + item.qty_ordered * Number(item.variant?.price_buy || 0),
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
        if (row.status === 'RECEIVED') badgeColor = 'bg-teal-50 text-teal-700 border-teal-200';
        if (row.status === 'DRAFT') badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
        if (row.status === 'OPEN') badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
        if (row.status === 'CANCELLED') badgeColor = 'bg-red-50 text-red-700 border-red-200';
        if (row.status === 'PARTIAL') badgeColor = 'bg-orange-50 text-orange-700 border-orange-200';

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
            { label: 'Edit', onClick: () => console.log('Edit', row.po_id) },
            { label: 'Print', onClick: () => console.log('Print', row.po_id) },
            { label: 'Hapus', onClick: () => console.log('Delete', row.po_id), variant: 'danger' },
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
        items={[{ label: 'Dashboard', path: '/admin' }, { label: 'Pesanan Pembelian' }]}
        className="mb-8"
      />

      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
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
            onFilterChange={handleFilter as never}
            onSortChange={handleSort as never}
            selectedCount={0}
            onDeleteSelected={() => console.log('Delete array')}
            onAddClick={() => navigate({ to: '/admin/pesanan-pembelian/create' as never })}
            addButtonLabel="Tambah Pesanan"
          />
        </div>
      </div>

      {/* Data Table Core */}
      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredOrders}
          isLoading={isLoading}
          keyExtractor={(row) => row.po_id}
          onRowSelectionChange={(selectedRows) => console.log('Selected POs:', selectedRows)}
        />
      </div>
    </div>
  );
}
