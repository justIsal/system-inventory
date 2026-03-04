import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';

import { Alert } from '@/components/molecules/Alert';
import { Modal } from '@/components/molecules/Modal';
import { formatRupiah } from '@/utils/format';
import { ArrowLeft, Calendar, Plus, Trash2, Store, Package } from 'lucide-react';

import { productService } from '@/services/api/productService';
import { salesOrderService } from '@/services/api/salesOrderService';
import { getPublicWarehouses } from '@/services/api/warehouseService';
import type { Product } from '@/types/product.types';
import type { WarehousePublicResponse } from '@/types/warehouse.types';
import type { CreateSalesOrderPayload } from '@/types/sales-order.types';

// Standin for the User Context
const getAdminId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.userId || 1;
  } catch {
    return 1;
  }
};

export const Route = createFileRoute('/admin/_layout/pesanan-penjualan/create')({
  component: CreateSalesOrderPage,
});

interface FormItemRow {
  id: string; // unique local ID for React array rendering
  variant_id: number;
  qty_requested: number;
  price_sell: number; // Stored separately to populate subtotal
}

function CreateSalesOrderPage() {
  const navigate = useNavigate();

  // -- Master Data State --
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<WarehousePublicResponse[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // -- Form State --
  const [customerName, setCustomerName] = useState<string>('');
  const [customerContact, setCustomerContact] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<number>(0);
  const [orderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<FormItemRow[]>([
    { id: crypto.randomUUID(), variant_id: 0, qty_requested: 1, price_sell: 0 },
  ]);
  const [notes, setNotes] = useState<string>('');

  // -- UI State --
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // -- Modals State --
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchMasterData = async () => {
    try {
      setIsLoadingData(true);
      const [prodRes, wareData] = await Promise.all([
        productService.getProducts(1, 100),
        getPublicWarehouses(),
      ]);
      setProducts(prodRes.data);
      setWarehouses(wareData);
    } catch (error) {
      console.error('Failed to load master data:', error);
      setNotification({
        type: 'error',
        message: 'Gagal memuat katalog produk. Pastikan server API berjalan.',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  // -- Row Management --
  const handleAddRow = () => {
    setItems([
      ...items,
      { id: crypto.randomUUID(), variant_id: 0, qty_requested: 1, price_sell: 0 },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    } else {
      setNotification({ type: 'error', message: 'Pesanan minimal harus memiliki 1 produk.' });
    }
  };

  const handleItemChange = (id: string, field: keyof FormItemRow, value: unknown) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Auto fill price_sell if variant changes
          if (field === 'variant_id' && value !== 0) {
            let foundPrice = 0;
            products.forEach((p) => {
              const v = p.variants?.find((v) => v.variant_id === Number(value));
              if (v) foundPrice = v.price_sell;
            });
            updatedItem.price_sell = foundPrice;
          }
          return updatedItem;
        }
        return item;
      }),
    );
  };

  // -- Calculations --
  const totalItems = items.reduce((sum, item) => sum + (Number(item.qty_requested) || 0), 0);
  const grandTotal = items.reduce(
    (sum, item) => sum + (Number(item.qty_requested) || 0) * (Number(item.price_sell) || 0),
    0,
  );

  // -- Submission --
  const validateForm = () => {
    if (!customerName.trim()) return 'Silakan masukkan Nama Pelanggan.';

    const hasEmptyVariant = items.some((i) => i.variant_id === 0);
    if (hasEmptyVariant) return 'Ada baris produk yang belum dipilih.';

    const hasInvalidQty = items.some((i) => i.qty_requested <= 0);
    if (hasInvalidQty) return 'Kuantitas (QTY) produk minimal 1.';

    return null;
  };

  const handleSubmit = async (status: 'DRAFT' | 'PENDING') => {
    const errorMsg = validateForm();
    if (errorMsg) {
      setNotification({ type: 'error', message: errorMsg });
      setShowConfirmModal(false);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateSalesOrderPayload = {
        customer_name: customerName,
        customer_contact: customerContact,
        shipping_address: shippingAddress,
        warehouse_id: warehouseId === 0 ? undefined : warehouseId,
        admin_id: getAdminId(),
        status: status,
        notes: notes,
        items: items.map((i) => ({
          variant_id: Number(i.variant_id),
          qty_requested: Number(i.qty_requested),
        })),
      };

      await salesOrderService.createSalesOrder(payload);
      setNotification({ type: 'success', message: `Pesanan (${status}) berhasil dibuat!` });

      setTimeout(() => {
        navigate({ to: '/admin/pesanan-penjualan' as never });
      }, 1500);
    } catch (error: unknown) {
      console.error('Submission error:', error);
      setNotification({
        type: 'error',
        message:
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Gagal menyimpan pesanan penjualan.',
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="mx-auto pb-10 animate-in fade-in duration-500">
      {/* Toast */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-100 animate-in slide-in-from-top-4 fade-in duration-300">
          <Alert variant={notification.type === 'error' ? 'destructive' : 'success'}>
            <div>{notification.message}</div>
          </Alert>
        </div>
      )}

      {/* Header & Nav */}
      <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', path: '/admin' },
            { label: 'Pesanan Penjualan', path: '/admin/pesanan-penjualan' },
            { label: 'Buat Pesanan Baru' },
          ]}
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: '/admin/pesanan-penjualan' as never })}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 focus:outline-none"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            BUAT PESANAN PENJUALAN
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSubmitting || isLoadingData}
          >
            Simpan Draft
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            onClick={() => {
              const err = validateForm();
              if (err) setNotification({ type: 'error', message: err });
              else setShowConfirmModal(true);
            }}
            disabled={isSubmitting || isLoadingData}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Terbitkan Pesanan (SO)
          </button>
        </div>
      </div>

      {isLoadingData ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-slate-500 font-medium">Memuat Katalog Produk...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: Informasi Transaksi */}
          <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">
                INFORMASI PELANGGAN & PENGIRIMAN
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2 lg:col-span-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Nama Pelanggan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-3 bg-white"
                  placeholder="Budi Santoso"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="space-y-2 lg:col-span-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Kontak (WA/Telp)
                </label>
                <input
                  type="text"
                  className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-3 bg-white"
                  placeholder="08123456789"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                />
              </div>

              <div className="space-y-2 lg:col-span-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Gudang Pengirim (Opsional)
                </label>
                <select
                  className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-3 bg-white"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(Number(e.target.value))}
                >
                  <option value={0}>---Pilih Gudang---</option>
                  {warehouses.map((w) => (
                    <option key={w.warehouse_id} value={w.warehouse_id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 lg:col-span-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Tanggal Pesanan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    disabled
                    className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2.5 pl-3 pr-10 bg-slate-50 cursor-not-allowed"
                    value={orderDate}
                  />
                </div>
              </div>

              <div className="space-y-2 lg:col-span-4">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Alamat Pengiriman
                </label>
                <textarea
                  className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-3 bg-white min-h-[80px]"
                  placeholder="Jl. Merdeka No. 123, Kelurahan ABC, Kecamatan DEF..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Daftar Produk */}
          <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">
                DAFTAR PRODUK (OUTBOUND)
              </h2>
              <button
                type="button"
                onClick={handleAddRow}
                className="text-sm text-indigo-600 font-semibold flex items-center gap-1 hover:text-indigo-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> Tambah Baris
              </button>
            </div>

            <div className="p-6 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col md:flex-row items-start gap-4"
                >
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-bold text-slate-600">PRODUK</label>
                    <select
                      className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-3 bg-white"
                      value={item.variant_id}
                      onChange={(e) => handleItemChange(item.id, 'variant_id', e.target.value)}
                    >
                      <option value={0}>--Pilih Produk--</option>
                      {products.map((p) => {
                        if (!p.has_variants) {
                          const variant = p.variants?.[0];
                          if (!variant) return null;
                          const stock =
                            variant.stocks?.reduce((acc, s) => acc + s.quantity, 0) || 0;
                          return (
                            <option
                              key={`p_${p.product_id}_v_${variant.variant_id}`}
                              value={variant.variant_id}
                              disabled={stock <= 0}
                            >
                              {p.name} {stock <= 0 ? '(Stok Habis)' : `(Sisa: ${stock})`}
                            </option>
                          );
                        } else {
                          return (
                            <optgroup key={`grp_${p.product_id}`} label={p.name}>
                              {p.variants?.map((v) => {
                                const stock =
                                  v.stocks?.reduce((acc, s) => acc + s.quantity, 0) || 0;
                                return (
                                  <option
                                    key={`v_${v.variant_id}`}
                                    value={v.variant_id}
                                    disabled={stock <= 0}
                                  >
                                    {p.name} - {v.name}{' '}
                                    {stock <= 0 ? '(Stok Habis)' : `(Sisa: ${stock})`}
                                  </option>
                                );
                              })}
                            </optgroup>
                          );
                        }
                      })}
                    </select>
                    {/* Find currently selected product to show stock */}
                    {item.variant_id !== 0 && (
                      <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-1">
                        <Store className="w-3 h-3" />
                        Stok gudang tersisa:
                        <span className="text-indigo-600">
                          {(() => {
                            let stok = 0;
                            products.forEach((p) => {
                              const targetVariant = p.variants?.find(
                                (v) => v.variant_id === Number(item.variant_id),
                              );
                              if (targetVariant?.stocks) {
                                stok = targetVariant.stocks.reduce((acc, s) => acc + s.quantity, 0);
                              }
                            });
                            return stok;
                          })()}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="w-full md:w-24 space-y-2">
                    <label className="text-xs font-bold text-slate-600">QTY DIKIRIM</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-3 bg-white"
                      value={item.qty_requested}
                      onChange={(e) => handleItemChange(item.id, 'qty_requested', e.target.value)}
                    />
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-bold text-slate-600">Harga Jual (IDR)</label>
                    <input
                      type="number"
                      className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-3 bg-white text-right font-medium"
                      value={item.price_sell}
                      onChange={(e) => handleItemChange(item.id, 'price_sell', e.target.value)}
                    />
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase">Subtotal</label>
                    <div className="py-2.5 px-3 text-sm font-bold text-slate-800 tracking-wide text-right">
                      {formatRupiah(
                        (Number(item.qty_requested) || 0) * (Number(item.price_sell) || 0),
                      )}
                    </div>
                  </div>

                  <div className="pt-7 w-full md:w-auto flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(item.id)}
                      className="p-2 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-800 tracking-wide">
                  RINGKASAN ESTIMASI REVENUE
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
                  <span>Total Jenis Item</span>
                  <span className="text-slate-900">{items.length} Produk</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-600 border-b border-slate-100 pb-4">
                  <span>Total Qty Keluar</span>
                  <span className="text-slate-900">{totalItems} pcs</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold text-slate-900">Grand Total</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-800 tracking-wide">
                  CATATAN TAMBAHAN (RESI/EKSPEDISI)
                </h2>
              </div>
              <div className="p-6">
                <textarea
                  className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-4 bg-white min-h-[128px] resize-y"
                  placeholder="Misal: Nomor resi JNE: Okyxxx, wajib packing kayu..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Checkout Confirm Modal --- */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Konfirmasi Terbitkan SO"
        icon={<Package className="w-6 h-6 text-indigo-600" />}
        description="Harap periksa kembali detail pesanan penjualan Anda sebelum diterbitkan."
      >
        <div className="p-6 space-y-6">
          <div className="flex bg-slate-50 rounded-lg border border-slate-100 p-4 divide-x divide-slate-200">
            <div className="flex-1 pr-4">
              <p className="text-xs text-slate-500 font-bold mb-1">PELANGGAN</p>
              <p className="text-sm font-semibold text-slate-900">{customerName}</p>
              {customerContact && <p className="text-xs text-slate-500 mt-1">{customerContact}</p>}
            </div>
            <div className="flex-1 px-4">
              <p className="text-xs text-slate-500 font-bold mb-1">PENGIRIMAN DARI (GUDANG)</p>
              <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                {warehouses.find((w) => w.warehouse_id === warehouseId)?.name ||
                  'Semua Gudang (Default)'}
              </p>
            </div>
            <div className="flex-1 pl-4">
              <p className="text-xs text-slate-500 font-bold mb-1">ALAMAT TUJUAN</p>
              <p className="text-sm font-medium text-slate-800 line-clamp-3 leading-snug">
                {shippingAddress || '-'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-3 border-b pb-2">
              RINCIAN OUTBOUND ({items.length} Baris)
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {items.map((item) => {
                let productName = 'Produk tidak ditemukan';
                products.forEach((p) => {
                  const v = p.variants?.find((v) => v.variant_id === Number(item.variant_id));
                  if (v) productName = p.has_variants ? `${p.name} - ${v.name}` : p.name;
                });

                return (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 max-w-[60%]">
                      <div className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {item.qty_requested}
                      </div>
                      <p className="truncate font-medium text-slate-800">{productName}</p>
                    </div>
                    <div className="font-bold text-slate-700">
                      {formatRupiah(item.qty_requested * item.price_sell)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-indigo-800 uppercase">Grand Estimasi Revenue</p>
              <p className="text-xs text-indigo-600/80 mt-0.5">
                Akan dicatat sebagai PENDING Sales Order
              </p>
            </div>
            <p className="text-xl font-black text-indigo-700">{formatRupiah(grandTotal)}</p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            className="px-4 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => setShowConfirmModal(false)}
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => handleSubmit('PENDING')}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Memproses...' : 'Terbitkan SO Sekarang'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
