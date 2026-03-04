import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';
import { salesOrderService } from '@/services/api/salesOrderService';
import type { SalesOrder } from '@/types/sales-order.types';
import { Alert } from '@/components/molecules/Alert';
import { ArrowLeft, Printer } from 'lucide-react';
import { formatRupiah } from '@/utils/format';

export const Route = createFileRoute('/admin/_layout/pesanan-penjualan/$soId/')({
  component: SalesOrderDetailPage,
});

function SalesOrderDetailPage() {
  const { soId } = Route.useParams();
  const navigate = useNavigate();
  const [so, setSo] = useState<SalesOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const data = await salesOrderService.getSalesOrderById(Number(soId));
        setSo(data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat detail Pesanan Penjualan.');
      } finally {
        setIsLoading(false);
      }
    };

    if (soId) {
      fetchDetail();
    }
  }, [soId]);

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-slate-500 font-medium">Memuat Detail Pesanan (SO)...</p>
      </div>
    );
  }

  if (error || !so) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">{error || 'Pesanan tidak ditemukan.'}</Alert>
        <button
          onClick={() => navigate({ to: '/admin/pesanan-penjualan' })}
          className="text-indigo-600 hover:underline text-sm font-medium"
        >
          Kembali ke Daftar Pesanan Penjualan
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  // Status Badge styling logic
  let badgeColor = 'bg-slate-100 text-slate-800';
  if (so.status === 'DELIVERED') badgeColor = 'bg-[#107F40] text-white';
  if (so.status === 'SHIPPED') badgeColor = 'bg-[#4F46E5] text-white'; // Indigo 600
  if (so.status === 'DRAFT') badgeColor = 'bg-slate-500 text-white';
  if (so.status === 'PENDING') badgeColor = 'bg-amber-500 text-white';
  if (so.status === 'CANCELLED') badgeColor = 'bg-red-600 text-white';

  const getStatusText = (status: string) => status;

  // Tracking Steps
  const steps = [
    { id: '1', label: 'DRAFT', statusKey: 'DRAFT' },
    { id: '2', label: 'PENDING', statusKey: 'PENDING' },
    { id: '3', label: 'SHIPPED', statusKey: 'SHIPPED' },
    { id: '4', label: 'DELIVERED', statusKey: 'DELIVERED' },
  ];

  // Determine active step index
  const statusLevels: Record<string, number> = {
    DRAFT: 0,
    PENDING: 1,
    SHIPPED: 2,
    DELIVERED: 3,
  };

  const currentLevel = statusLevels[so.status] ?? -1;

  const totalItemValue =
    so.items?.reduce(
      (sum, item) => sum + item.qty_requested * Number(item.variant?.price_sell || 0),
      0,
    ) || 0;

  return (
    <div className="mx-auto pb-10 space-y-6 animate-in fade-in duration-500 print:bg-white print:m-0 print:p-0">
      {/* Hide breadcrumbs on print */}
      <div className="print:hidden">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', path: '/admin' },
            { label: 'Pesanan Penjualan', path: '/admin/pesanan-penjualan' },
            { label: 'Detail Penjualan' },
          ]}
        />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate({ to: '/admin/pesanan-penjualan' })}
            className="p-2 border border-indigo-200 bg-white rounded-lg hover:bg-indigo-50 transition-colors text-indigo-600 focus:outline-none print:hidden flex-shrink-0 mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">
              {so.customer_name || 'PELANGGAN UMUM (CASH)'}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Admin Pencatat: {so.admin?.username || '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Cetak SO / Invoice
          </button>
          <div className={`px-4 py-2 rounded-lg font-bold text-sm tracking-wide ${badgeColor}`}>
            STATUS: {getStatusText(so.status)}
          </div>
        </div>
      </div>

      {/* Tracking Status */}
      {so.status !== 'CANCELLED' && (
        <div className="print:hidden mt-8 mb-8">
          <h2 className="text-center text-lg font-bold text-slate-600 mb-6">Tracking Penjualan</h2>
          <div className="bg-white py-8 px-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center max-w-4xl mx-auto">
            <div className="flex items-center w-full max-w-2xl relative">
              {/* Background Line */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-200 z-0"></div>

              {/* Active Line */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-indigo-600 z-0 transition-all duration-500"
                style={{
                  width: currentLevel > 0 ? `${(currentLevel / (steps.length - 1)) * 100}%` : '0%',
                }}
              ></div>

              {steps.map((step, index) => {
                const isCompleted = index <= currentLevel;
                const isActive = index === currentLevel;

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors duration-300 relative
                      ${isCompleted ? 'bg-indigo-600 text-white' : 'bg-[#E2E8F0] text-white'}
                      ${isActive ? 'ring-4 ring-indigo-100' : ''}
                    `}
                      style={{ zIndex: 2 }}
                    >
                      {step.id}
                    </div>
                    <div
                      className={`mt-3 px-3 py-1 rounded-full text-xs font-bold tracking-wider 
                    ${isCompleted ? 'text-indigo-600 bg-indigo-50' : 'text-[#94A3B8] bg-[#F8FAFC]'}
                  `}
                    >
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Detail Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Info Customer & Shipping */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-lg font-bold text-slate-600">Info Pengiriman</h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-5">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Kontak (Phone/WA)
              </p>
              <p className="text-sm font-bold text-slate-800">{so.customer_contact || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Alamat Pengiriman Lengkap
              </p>
              <p className="text-sm font-bold text-slate-800 leading-snug">
                {so.shipping_address || '-'}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Gudang Asal (Pengirim)
              </p>
              <p className="text-sm font-bold text-slate-800">
                {so.warehouse?.name || 'Semua Gudang (Default)'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Items */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-bold text-slate-600">Produk yang Dijual (Outbound)</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Print Only Header (Visible only when printed) */}
            <div className="hidden print:block p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-xl font-black text-slate-900 mb-2">SALES ORDER (INVOICE)</h2>
              <div className="grid grid-cols-2 text-sm">
                <div>
                  <p className="text-slate-500">No. SO:</p>
                  <p className="font-bold">
                    #SO-{new Date(so.created_at).getFullYear()}-{String(so.so_id).padStart(3, '0')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Tanggal:</p>
                  <p className="font-bold">
                    {new Date(so.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#E9EDF5] text-slate-600 font-bold border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-xl print:rounded-none">Produk</th>
                    <th className="px-6 py-4">Harga Satuan</th>
                    <th className="px-6 py-4">QTY</th>
                    <th className="px-6 py-4 text-right rounded-tr-xl print:rounded-none">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {so.items?.map((item) => {
                    const productName =
                      (item.variant as { product?: { name: string } })?.product?.name ||
                      `Produk ID: ${item.variant_id}`;

                    const variantName = item.variant?.name ? ` - ${item.variant.name}` : '';

                    return (
                      <tr key={item.so_item_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {productName}
                          {variantName}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatRupiah(item.variant?.price_sell || 0)}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-bold">{item.qty_requested}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                          {formatRupiah(item.qty_requested * (item.variant?.price_sell || 0))}
                        </td>
                      </tr>
                    );
                  })}
                  {(!so.items || so.items.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">
                        Tidak ada item pada pesanan ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Total */}
            <div className="bg-slate-50/80 p-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Catatan Pengiriman
                </p>
                <p className="text-sm font-medium text-slate-700 max-w-md">{so.notes || '-'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Grand Total Revenue
                </p>
                <p className="text-2xl font-black text-indigo-700">
                  {formatRupiah(totalItemValue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
