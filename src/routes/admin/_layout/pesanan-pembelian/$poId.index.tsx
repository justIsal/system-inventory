import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';
import { purchaseOrderService } from '@/services/api/purchaseOrderService';
import type { PurchaseOrder } from '@/types/purchase-order.types';
import { Alert } from '@/components/molecules/Alert';
import { ArrowLeft, Printer } from 'lucide-react';
import { formatRupiah } from '@/utils/format';

export const Route = createFileRoute('/admin/_layout/pesanan-pembelian/$poId/')({
  component: PurchaseOrderDetailPage,
});

function PurchaseOrderDetailPage() {
  const { poId } = Route.useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const data = await purchaseOrderService.getPurchaseOrderById(Number(poId));
        setPo(data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat detail Pesanan Pembelian.');
      } finally {
        setIsLoading(false);
      }
    };

    if (poId) {
      fetchDetail();
    }
  }, [poId]);

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-slate-500 font-medium">Memuat Detail Pesanan...</p>
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">{error || 'Pesanan tidak ditemukan.'}</Alert>
        <button
          onClick={() => navigate({ to: '/admin/pesanan-pembelian' })}
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          Kembali ke Daftar Pesanan
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  // Status Badge styling logic
  let badgeColor = 'bg-slate-100 text-slate-800';
  if (po.status === 'RECEIVED') badgeColor = 'bg-[#107F40] text-white'; // Match mockup dark green
  if (po.status === 'DRAFT') badgeColor = 'bg-slate-500 text-white';
  if (po.status === 'OPEN') badgeColor = 'bg-blue-600 text-white';
  if (po.status === 'CANCELLED') badgeColor = 'bg-red-600 text-white';
  if (po.status === 'NEEDS_APPROVAL') badgeColor = 'bg-amber-500 text-white animate-pulse';

  if (po.status === 'PARTIAL') badgeColor = 'bg-[#107F40] text-white';

  const getStatusText = (status: string) => {
    if (status === 'PARTIAL') return 'PARTIAL DELIVERY';
    return status;
  };

  // Tracking Steps
  const steps = [
    { id: '1', label: 'DRAFT', statusKey: 'DRAFT' },
    { id: '2', label: 'OPEN', statusKey: 'OPEN' },
    { id: '3', label: 'PARTIAL', statusKey: 'PARTIAL' },
    { id: '4', label: 'RECEIVED', statusKey: 'RECEIVED' },
  ];

  // Determine active step index
  const statusLevels: Record<string, number> = {
    DRAFT: 0,
    OPEN: 1,
    PARTIAL: 2,
    RECEIVED: 3,
  };

  const currentLevel = statusLevels[po.status] ?? -1;

  const totalItemValue =
    po.items?.reduce(
      (sum, item) => sum + item.qty_ordered * Number(item.variant?.price_buy || 0),
      0,
    ) || 0;

  const handleResolve = async () => {
    try {
      if (
        !confirm(
          'Anda yakin ingin Menerima Fisik (Accept Discrepancy)? Stok akan bertambah sesuai kuantitas fisik terbaru yang dihitung staff.',
        )
      ) {
        return;
      }
      setIsLoading(true);
      await purchaseOrderService.resolvePurchaseOrderDiscrepancy(Number(poId), {
        resolution: 'ACCEPT_DISCREPANCY',
      });
      alert('Penyelesaian berhasil. Stok telah diupdate.');
      window.location.reload();
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message || 'Gagal menyetujui selisih.');
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto pb-10 space-y-6 animate-in fade-in duration-500 print:bg-white print:m-0 print:p-0">
      {/* Hide breadcrumbs on print */}
      <div className="print:hidden">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', path: '/admin' },
            { label: 'Pesanan Pembelian', path: '/admin/pesanan-pembelian' },
            { label: 'Detail Pesanan' },
          ]}
        />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate({ to: '/admin/pesanan-pembelian' })}
            className="p-2 border border-blue-200 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 focus:outline-none print:hidden shrink-0 mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">
              {po.supplier?.name || 'SUPPLIER TIDAK DIKETAHUI'}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              ID Supplier: SUP-{String(po.supplier_id).padStart(3, '0')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          {po.status === 'NEEDS_APPROVAL' && (
            <button
              onClick={handleResolve}
              className="px-4 py-2 rounded-lg font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center shadow-sm"
            >
              Approve Selisih Fisik
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Cetak PO
          </button>
          <div className={`px-4 py-2 rounded-lg font-bold text-sm tracking-wide ${badgeColor}`}>
            STATUS: {getStatusText(po.status)}
          </div>
        </div>
      </div>

      {/* Tracking Status */}
      {po.status !== 'CANCELLED' && (
        <div className="print:hidden mt-8 mb-8">
          <h2 className="text-center text-lg font-bold text-slate-600 mb-6">Tracking Status</h2>
          <div className="bg-white py-8 px-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center max-w-4xl mx-auto">
            <div className="flex items-center w-full max-w-2xl relative">
              {/* Background Line */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-200 z-0"></div>

              {/* Active Line */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#3B82F6] z-0 transition-all duration-500"
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
                      ${isCompleted ? 'bg-[#3B82F6] text-white' : 'bg-[#E2E8F0] text-white'}
                      ${isActive ? 'ring-4 ring-[#DBEAFE]' : ''}
                    `}
                      style={{ zIndex: 2 }}
                    >
                      {step.id}
                    </div>
                    <div
                      className={`mt-3 px-3 py-1 rounded-full text-xs font-bold tracking-wider 
                    ${isCompleted ? 'text-[#3B82F6] bg-[#EFF6FF]' : 'text-[#94A3B8] bg-[#F8FAFC]'}
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
        {/* Left Col: Info Supplier */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-lg font-bold text-slate-600">Info Supplier</h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-5">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Nama PIC
              </p>
              <p className="text-sm font-bold text-slate-800">
                {po.supplier?.contact_person || 'Bpk. Andi Wijaya'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Alamat
              </p>
              <p className="text-sm font-bold text-slate-800 leading-snug">
                {po.supplier?.address || '-'}
              </p>
            </div>
            {po.warehouse && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Gudang Tujuan Bongkar
                </p>
                <p className="text-sm font-bold text-blue-700">{po.warehouse.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Items */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-bold text-slate-600">Item yang dipesan</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Print Only Header (Visible only when printed) */}
            <div className="hidden print:block p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-xl font-black text-slate-900 mb-2">PURCHASE ORDER</h2>
              <div className="grid grid-cols-2 text-sm">
                <div>
                  <p className="text-slate-500">No. PO:</p>
                  <p className="font-bold">
                    #PO-{new Date(po.created_at).getFullYear()}-{String(po.po_id).padStart(3, '0')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Tanggal:</p>
                  <p className="font-bold">
                    {new Date(po.created_at).toLocaleDateString('id-ID', {
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
                    <th className="px-6 py-4 rounded-tl-xl print:rounded-none">No. PO</th>
                    <th className="px-6 py-4">Tgl Pesan</th>
                    <th className="px-6 py-4">Barang</th>
                    <th className="px-6 py-4 text-center">Fisik (Scan)</th>
                    <th className="px-6 py-4 text-right rounded-tr-xl print:rounded-none">
                      Ekspektasi (DO)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {po.items?.map((item) => {
                    const productName =
                      (item.variant as { product?: { name: string } })?.product?.name ||
                      `Produk ID: ${item.variant_id}`;

                    return (
                      <tr key={item.po_item_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">
                          #PO-{new Date(po.created_at).getFullYear()}-
                          {String(po.po_id).padStart(3, '0')}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(po.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{productName}</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-800">
                          {item.qty_received}
                          {item.qty_received !== item.qty_ordered && (
                            <span className="ml-2 text-[10px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full inline-block">
                              Selisih
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                          {item.qty_ordered} Unit
                        </td>
                      </tr>
                    );
                  })}
                  {(!po.items || po.items.length === 0) && (
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
                  Catatan Pesanan
                </p>
                <p className="text-sm font-medium text-slate-700 max-w-md">{po.notes || '-'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Total Transaksi
                </p>
                <p className="text-2xl font-black text-[#107F40]">{formatRupiah(totalItemValue)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
