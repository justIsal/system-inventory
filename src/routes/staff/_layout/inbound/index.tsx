import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Search, Loader2, PackageOpen, AlertCircle } from 'lucide-react';
import { purchaseOrderService } from '@/services/api/purchaseOrderService';
import { getMe } from '@/services/api/userService';
import type { PurchaseOrder } from '@/types/purchase-order.types';

export const Route = createFileRoute('/staff/_layout/inbound/')({
  component: InboundDashboard,
});

function InboundDashboard() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPOs = async () => {
    try {
      setIsLoading(true);
      // 1. Dapatkan profil user untuk mengetahui dia bertugas di gudang mana
      const profile = await getMe();
      const warehouseId = profile.warehouse_id;

      if (!warehouseId) {
        console.warn('Staff ini belum diassign ke gudang manapun.');
        setPurchaseOrders([]);
        return;
      }

      // 2. Fetch PO yang ditujukan/terkait dengan warehouse tersebut
      const data = await purchaseOrderService.getPurchaseOrdersByWarehouse(warehouseId);

      // Only show POs that warehouse staff can act upon
      const activePOs = data.filter(
        (po) => po.status === 'OPEN' || po.status === 'PARTIAL' || po.status === 'NEEDS_APPROVAL',
      );
      setPurchaseOrders(activePOs);
    } catch (error) {
      console.error('Failed to fetch Purchase Orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const filteredPOs = purchaseOrders.filter(
    (po) =>
      po.supplier?.name?.toLowerCase().includes(search.toLowerCase()) ||
      po.po_id.toString().includes(search),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* <PageHeader
        title="Daftar Penerimaan Barang (Inbound)"
        description="Tinjau dan validasi barang fisik yang masuk dari pesanan pembelian aktif."
      /> */}

      {/* --- Filter / Toolbar --- */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ID PO atau Nama Supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* --- Data List --- */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Memuat Daftar Inbound...</p>
        </div>
      ) : filteredPOs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-slate-200 shadow-sm text-center px-4">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <PackageOpen className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Tidak Ada Jadwal Inbound</h3>
          <p className="text-slate-500 max-w-sm">
            Saat ini tidak ada Pesanan Pembelian terbuka yang menunggu barang untuk diterima di
            gudang Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPOs.map((po) => {
            const isNeedApproval = po.status === 'NEEDS_APPROVAL';

            return (
              <div
                key={po.po_id}
                className={`bg-white rounded-xl border ${
                  isNeedApproval
                    ? 'border-amber-400 shadow-[0_0_15px_-3px_rgba(251,191,36,0.3)]'
                    : 'border-slate-200 shadow-sm hover:shadow-md'
                } overflow-hidden transition-all duration-300 flex flex-col`}
              >
                <div
                  className={`px-5 py-4 flex justify-between items-center ${isNeedApproval ? 'bg-amber-50/50' : 'border-b border-slate-100'}`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-400 tracking-wider">
                      NOMOR PO
                    </span>
                    <h3 className="text-lg font-black text-slate-800">#{po.po_id}</h3>
                  </div>
                  <div
                    className={`px-3 py-1 text-[11px] font-bold rounded-full border ${
                      isNeedApproval
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : po.status === 'PARTIAL'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {po.status}
                  </div>
                </div>

                <div className="p-5 flex-1 space-y-4">
                  {isNeedApproval && (
                    <div className="flex items-start gap-2 text-xs font-semibold text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100/50">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>
                        PO ini memiliki selisih fisik penerimaan sebelumnya dan sedang menunggu
                        investigasi Admin.
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">SUPPLIER</p>
                    <p className="text-sm font-bold text-slate-900">{po.supplier?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">JUMLAH ITEM (SKU)</p>
                    <p className="text-sm font-bold text-slate-900">
                      {po.items?.length || 0} Jenis Barang
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">DIBUAT PADA</p>
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(po.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <a
                    href={`/staff/inbound/${po.po_id}`}
                    className={`block w-full text-center py-2.5 rounded-lg text-sm font-bold transition-colors ${
                      isNeedApproval
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isNeedApproval ? 'Lihat Progress' : 'Mulai Cek Fisik'}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
