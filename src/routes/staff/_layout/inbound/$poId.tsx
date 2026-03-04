import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Modal } from '@/components/molecules/Modal';
import {
  ArrowLeft,
  Calendar,
  PackageCheck,
  Building2,
  AlertCircle,
  Truck,
  Loader2,
} from 'lucide-react';

import { purchaseOrderService } from '@/services/api/purchaseOrderService';
import { getPublicWarehouses } from '@/services/api/warehouseService';
import { getMe } from '@/services/api/userService';
import type { PurchaseOrder } from '@/types/purchase-order.types';
import type { WarehousePublicResponse } from '@/types/warehouse.types';
import { toast } from 'sonner';

export const Route = createFileRoute('/staff/_layout/inbound/$poId')({
  component: InboundValidationPage,
});

function InboundValidationPage() {
  const navigate = useNavigate();
  const { poId } = Route.useParams();

  // -- Master Data State --
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [warehouses, setWarehouses] = useState<WarehousePublicResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // -- Form State --
  // We match the DB so `id` equals `po_item_id`
  const [receivedItems, setReceivedItems] = useState<{ id: number; qty: string }[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(0);

  // -- UI State --
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasDiscrepancy, setHasDiscrepancy] = useState(false);

  const fetchDetail = async () => {
    try {
      setIsLoading(true);
      const [poData, wareData, profileData] = await Promise.all([
        purchaseOrderService.getPurchaseOrderById(Number(poId)),
        getPublicWarehouses(),
        getMe(),
      ]);
      setPo(poData);
      setWarehouses(wareData);

      if (profileData?.warehouse_id) {
        setSelectedWarehouseId(profileData.warehouse_id);
      }

      // Initialize form with 0 or empty so staff MUST type it
      if (poData.items) {
        setReceivedItems(
          poData.items.map((item) => ({
            id: item.po_item_id,
            qty: item.qty_ordered.toString(), // By default pre-fill with ordered qty to speed up, but they can edit
          })),
        );
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat detail PO.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [poId]);

  const handleQtyChange = (id: number, value: string) => {
    setReceivedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: value } : item)),
    );
  };

  const handleValidation = () => {
    if (selectedWarehouseId === 0) {
      toast.error('Pilih Gudang Penerima terlebih dahulu!');
      return;
    }

    let allEmptyOrZero = true;
    let anyDiscrepancy = false;

    for (const reqItem of receivedItems) {
      const dbItem = po?.items?.find((i) => i.po_item_id === reqItem.id);
      const val = parseInt(reqItem.qty) || 0;

      if (val > 0) allEmptyOrZero = false;
      if (dbItem && val !== dbItem.qty_ordered) {
        anyDiscrepancy = true;
      }
    }

    if (allEmptyOrZero) {
      toast.error('Total barang yang diterima tidak boleh 0 semua. Isi setidaknya 1.');
      return;
    }

    setHasDiscrepancy(anyDiscrepancy);
    setShowConfirmModal(true);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        warehouse_id: selectedWarehouseId,
        items: receivedItems.map((i) => ({
          po_item_id: i.id,
          qty_received: parseInt(i.qty) || 0,
        })),
      };

      const res = await purchaseOrderService.receivePurchaseOrder(Number(poId), payload);

      if (res.status === 'NEEDS_APPROVAL') {
        toast.warning(
          'Penerimaan dicatat dengan SELISIH. Menunggu konfirmasi Admin (NEEDS_APPROVAL).',
        );
      } else {
        toast.success('Penerimaan berhasil! Stok gudang telah bertambah.');
      }

      setTimeout(() => {
        navigate({ to: '/staff/inbound' as never });
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Gagal memproses penerimaan.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Memuat Detail Pesanan (PO)...</p>
      </div>
    );
  }

  if (!po) {
    return (
      <div className="bg-white p-8 rounded-xl border border-red-200 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">PO Tidak Ditemukan</h3>
        <button
          onClick={() => navigate({ to: '/staff/inbound' as never })}
          className="mt-4 text-indigo-600 font-semibold hover:underline"
        >
          Kembali ke Daftar Inbound
        </button>
      </div>
    );
  }

  // Derived Values
  const totalItemJenis = po.items?.length || 0;
  const totalQtyOrdered = po.items?.reduce((sum, item) => sum + item.qty_ordered, 0) || 0;
  const totalQtyMapped = receivedItems.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);
  const difference = totalQtyMapped - totalQtyOrdered;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate({ to: '/staff/inbound' as never })}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 focus:outline-none"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {/* <PageHeader
          title={`Validasi Penerimaan PO #${po.po_id}`}
          description={`Verifikasi fisik barang masuk dari ${po.supplier?.name || 'Supplier'}`}
        /> */}
      </div>

      {po.status === 'NEEDS_APPROVAL' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold mb-1">Status: Menunggu Persetujuan Admin</p>
            <p>
              PO ini sudah divalidasi dan tercatat memiliki selisih fisik. Anda dapat memperbarui
              angka di bawah ini jika terjadi kesalahan hitung, namun form ini tetap akan ditinjau
              oleh Admin.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1: PO Context Info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Truck className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-800 tracking-wide">
            DETAIL MANIFEST PENERIMAAN
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Distributor / Supplier
            </p>
            <p className="text-sm font-bold text-slate-800">{po.supplier?.name}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Tanggal DO / Terbit
            </p>
            <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              {new Date(po.created_at).toLocaleDateString('id-ID')}
            </p>
          </div>
          <div className="lg:col-span-2 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Tujuan Gudang Bongkar <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-4 w-4 text-slate-400" />
              </div>
              <select
                className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2.5 pl-9 pr-3 bg-slate-50 font-medium text-slate-700 cursor-not-allowed appearance-none"
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
                disabled
              >
                <option value={0}>--Wajib Pilih Gudang--</option>
                {warehouses.map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Item Check List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800 tracking-wide">DAFTAR BARANG MASUK</h2>
          <div className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold">
            {totalItemJenis} SKU
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-6">Nama Produk / SKU</div>
            <div className="col-span-2 text-center">Ekspektasi (DO)</div>
            <div className="col-span-4 text-right pr-2">Jumlah Fisik Diterima</div>
          </div>

          {po.items?.map((item) => {
            const variantObj = item.variant as
              | { product?: { name: string }; name?: string; sku?: string }
              | undefined;
            const productName = variantObj?.product?.name || `Product #${item.variant_id ?? ''}`;
            const variantName = variantObj?.name ? ` - ${variantObj.name}` : '';
            const fullName = `${productName}${variantName}`;

            const physValStr = receivedItems.find((r) => r.id === item.po_item_id)?.qty || '0';
            const physVal = parseInt(physValStr) || 0;
            const isDiff = physVal !== item.qty_ordered;

            return (
              <div
                key={item.po_item_id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 md:items-center p-4 md:p-0 rounded-xl md:rounded-none border border-slate-100 md:border-none bg-slate-50 md:bg-transparent"
              >
                {/* Product Name */}
                <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
                  <p className="font-bold text-slate-800 text-sm">{fullName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">SKU: {variantObj?.sku || '-'}</p>
                </div>

                {/* DO QTY */}
                <div className="col-span-6 md:col-span-2 flex flex-col md:items-center justify-center">
                  <p className="text-[10px] md:hidden font-bold text-slate-500 uppercase mb-1">
                    DO Qty
                  </p>
                  <span className="inline-flex items-center justify-center w-auto md:w-16 px-3 py-1 rounded bg-slate-100 text-slate-600 font-bold text-sm">
                    {item.qty_ordered}
                  </span>
                </div>

                {/* Fisik QTY */}
                <div className="col-span-6 md:col-span-4 flex flex-col md:items-end justify-center">
                  <p className="text-[10px] md:hidden font-bold text-slate-500 uppercase mb-1">
                    Fisik Qty
                  </p>
                  <div className="relative w-full md:w-32">
                    <input
                      type="number"
                      min="0"
                      className={`w-full text-sm font-bold rounded-lg focus:ring-2 focus:outline-none py-2 px-3 bg-white border ${
                        isDiff
                          ? 'border-amber-400 text-amber-700 focus:ring-amber-200'
                          : 'border-slate-300 text-indigo-700 focus:border-indigo-500 focus:ring-indigo-100'
                      }`}
                      value={physValStr}
                      onChange={(e) => handleQtyChange(item.po_item_id, e.target.value)}
                    />
                    {isDiff && (
                      <div className="absolute -right-2 -top-2 w-4 h-4 bg-amber-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Sum */}
        <div className="bg-slate-50 border-t border-slate-100 p-6 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            {difference !== 0 && (
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 bg-amber-100 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                Total Selisih:{' '}
                {difference > 0 ? `+${difference} (Surplus)` : `${difference} (Kurang)`}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-slate-500 font-bold text-xs uppercase mb-1">Total System (DO)</p>
              <p className="font-black text-slate-700 text-xl">{totalQtyOrdered}</p>
            </div>
            <div className="h-8 w-px bg-slate-300"></div>
            <div className="text-center">
              <p className="text-slate-500 font-bold text-xs uppercase mb-1">
                Total Validasi Fisik
              </p>
              <p
                className={`font-black text-xl ${difference !== 0 ? 'text-amber-600' : 'text-emerald-600'}`}
              >
                {totalQtyMapped}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleValidation}
          disabled={isSubmitting}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
        >
          <PackageCheck className="w-5 h-5" />
          Konfirmasi Hitung & Terima Barang
        </button>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !isSubmitting && setShowConfirmModal(false)}
        title={hasDiscrepancy ? 'Peringatan Selisih Barang' : 'Konfirmasi Penerimaan Barang'}
        icon={
          hasDiscrepancy ? (
            <AlertCircle className="w-6 h-6 text-amber-500" />
          ) : (
            <PackageCheck className="w-6 h-6 text-emerald-500" />
          )
        }
        description={
          hasDiscrepancy
            ? 'Terdapat selisih antara Dokumen PO dan Fisik. Sistem akan meminta approval Admin.'
            : 'Semua kuantitas cocok. Stok Gudang akan otomatis bertambah.'
        }
      >
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-sm font-semibold mb-2">
              <span className="text-slate-600">Gudang Tujuan:</span>
              <span className="text-slate-900">
                {warehouses.find((w) => w.warehouse_id === selectedWarehouseId)?.name}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-600">Status Tindakan:</span>
              <span
                className={`px-2 py-0.5 rounded text-xs ${hasDiscrepancy ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}
              >
                {hasDiscrepancy ? 'NEEDS_APPROVAL' : 'RECEIVED & STOCK IN'}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600">
            Apakah Anda yakin catatan kuantitas fisik sudah final?
          </p>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-300 font-semibold rounded-lg hover:bg-slate-50"
          >
            Koreksi Lagi
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 text-white font-bold rounded-lg flex items-center justify-center min-w-[120px] ${
              hasDiscrepancy
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ya, Kirim Data'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
