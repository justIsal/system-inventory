import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';

import { Alert } from '@/components/molecules/Alert';
import { Modal } from '@/components/molecules/Modal';
import { ProductForm } from '@/components/organisms/ProductForm';
import { SupplierForm } from '@/components/organisms/SupplierForm';
import { formatRupiah } from '@/utils/format';
import { ArrowLeft, Calendar, Save, Trash2, Store, Package, Plus } from 'lucide-react';

import { supplierService, type Supplier } from '@/services/api/supplierService';
import { productService } from '@/services/api/productService';
import { getPublicWarehouses } from '@/services/api/warehouseService';
import { purchaseOrderService } from '@/services/api/purchaseOrderService';
import type { Product } from '@/types/product.types';
import type { WarehousePublicResponse } from '@/types/warehouse.types';
import type { CreatePurchaseOrderPayload, PurchaseOrder } from '@/types/purchase-order.types';

export const Route = createFileRoute('/admin/_layout/pesanan-pembelian/$poId/edit')({
  component: EditPurchaseOrderPage,
});

interface FormItemRow {
  id: string; // unique local ID for React array rendering
  variant_id: number;
  qty_ordered: number;
  price_buy: number;
  notes?: string;
}

function EditPurchaseOrderPage() {
  const navigate = useNavigate();
  const { poId } = Route.useParams();

  // -- Master Data State --
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<WarehousePublicResponse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // -- Extracted PO Data --
  const [originalPo, setOriginalPo] = useState<PurchaseOrder | null>(null);

  const [isLoadingData, setIsLoadingData] = useState(true);

  // -- Form State --
  const [supplierId, setSupplierId] = useState<number>(0);
  const [orderDate, setOrderDate] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<number>(0);
  const [items, setItems] = useState<FormItemRow[]>([]);
  const [notes, setNotes] = useState<string>('');

  // -- UI State --
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // -- Modals State --
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // Fetch Master Data AND Original PO
  const fetchAllData = async () => {
    if (!poId) return;

    try {
      setIsLoadingData(true);
      const [suppliersRes, wareData, prodRes, poData] = await Promise.all([
        supplierService.getSuppliers(1, 100),
        getPublicWarehouses(),
        productService.getProducts(1, 100),
        purchaseOrderService.getPurchaseOrderById(Number(poId)),
      ]);
      setSuppliers(suppliersRes.data);
      setWarehouses(wareData);
      setProducts(prodRes.data);
      setOriginalPo(poData);

      // Hydrate Form
      setSupplierId(poData.supplier_id);
      setOrderDate(new Date(poData.created_at).toISOString().split('T')[0]);
      setNotes(poData.notes || '');

      if (poData.items && poData.items.length > 0) {
        setItems(
          poData.items.map((item) => ({
            id: crypto.randomUUID(),
            variant_id: item.variant_id,
            qty_ordered: item.qty_ordered,
            price_buy: item.variant?.price_buy || 0,
            notes: item.notes || '',
          })),
        );
      } else {
        setItems([{ id: crypto.randomUUID(), variant_id: 0, qty_ordered: 1, price_buy: 0 }]);
      }
    } catch (error) {
      console.error('Failed to load edit data:', error);
      setNotification({
        type: 'error',
        message: 'Gagal memuat data Master atau Pesanan (Mungkin ID tidak ditemukan/Terhapus).',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [poId]);

  // -- Row Management --
  const handleAddRow = () => {
    setItems([...items, { id: crypto.randomUUID(), variant_id: 0, qty_ordered: 1, price_buy: 0 }]);
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
          // Auto fill price_buy if variant changes
          if (field === 'variant_id' && value !== 0) {
            let foundPrice = 0;
            products.forEach((p) => {
              const v = p.variants?.find((v) => v.variant_id === Number(value));
              if (v) foundPrice = v.price_buy;
            });
            updatedItem.price_buy = foundPrice;
          }
          return updatedItem;
        }
        return item;
      }),
    );
  };

  // -- Calculations --
  const totalItems = items.reduce((sum, item) => sum + (Number(item.qty_ordered) || 0), 0);
  const grandTotal = items.reduce(
    (sum, item) => sum + (Number(item.qty_ordered) || 0) * (Number(item.price_buy) || 0),
    0,
  );
  const selectedSupplier = suppliers.find((s) => s.supplier_id === Number(supplierId));

  // -- Submission --
  const validateForm = () => {
    if (!supplierId || supplierId === 0) return 'Silakan pilih Supplier.';
    const hasEmptyVariant = items.some((i) => i.variant_id === 0);
    if (hasEmptyVariant) return 'Ada baris produk yang belum dipilih.';
    const hasInvalidQty = items.some((i) => i.qty_ordered <= 0);
    if (hasInvalidQty) return 'Kuantitas (QTY) produk minimal 1.';

    return null;
  };

  const handleSubmit = async (status: 'DRAFT' | 'OPEN') => {
    const errorMsg = validateForm();
    if (errorMsg) {
      setNotification({ type: 'error', message: errorMsg });
      setShowConfirmModal(false);
      return;
    }

    try {
      setIsSubmitting(true);

      // Omit admin_id since we're updating
      const payload: Omit<CreatePurchaseOrderPayload, 'admin_id'> = {
        supplier_id: Number(supplierId),
        status: status,
        notes: notes,
        items: items.map((i) => ({
          variant_id: Number(i.variant_id),
          qty_ordered: Number(i.qty_ordered),
          notes: i.notes,
        })),
      };

      await purchaseOrderService.updatePurchaseOrder(Number(poId), payload);
      setNotification({
        type: 'success',
        message: `Pesanan Pembelian #${poId} berhasil diperbarui!`,
      });

      setTimeout(() => {
        navigate({ to: '/admin/pesanan-pembelian' as never });
      }, 1500);
    } catch (error: unknown) {
      console.error('Submission error:', error);
      setNotification({
        type: 'error',
        message:
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Gagal memperbarui pesanan pembelian. Status PO (Contoh: RECEIVED) mungkin tidak bisa diedit.',
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  // Check if actually editable
  const isReadOnly = originalPo && originalPo.status !== 'DRAFT' && originalPo.status !== 'OPEN';

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
            { label: 'Pesanan Pembelian', path: '/admin/pesanan-pembelian' },
            { label: `Edit PO #${poId}` },
          ]}
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: '/admin/pesanan-pembelian' as never })}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 focus:outline-none"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">EDIT PESANAN (PO)</h1>
            {originalPo && (
              <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">
                Status Saat Ini: <span className="text-blue-600">{originalPo.status}</span>
              </p>
            )}
          </div>
        </div>

        {!isReadOnly && (
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
              className="px-4 py-2 rounded-lg font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
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
                <Save className="h-4 w-4" />
              )}
              Perbarui Pesanan (PO)
            </button>
          </div>
        )}
      </div>

      {isReadOnly && (
        <div className="mb-4">
          <Alert variant="warning">
            Karena status pesanan ini sudah <b>{originalPo.status}</b>, Anda tidak dapat mengubah
            data produk atau supplier. Mode Baca-Saja aktif.
          </Alert>
        </div>
      )}

      {isLoadingData ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-slate-500 font-medium">
            Memuat Data Master & Detail Pesanan...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: Informasi Transaksi */}
          <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">
                INFORMASI TRANSAKSI
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Pilih Supplier
                </label>
                <select
                  disabled={isReadOnly || false}
                  className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 bg-white disabled:bg-slate-100 disabled:opacity-75"
                  value={supplierId}
                  onChange={(e) => {
                    if (e.target.value === 'ADD_NEW') setShowSupplierModal(true);
                    else setSupplierId(Number(e.target.value));
                  }}
                >
                  <option value={0}>---Cari Supplier---</option>
                  {suppliers.map((s) => (
                    <option key={s.supplier_id} value={s.supplier_id}>
                      {s.name}
                    </option>
                  ))}
                  {!isReadOnly && (
                    <>
                      <option disabled>──────────</option>
                      <option value="ADD_NEW" className="text-blue-600 font-semibold">
                        + Tambah Supplier Baru
                      </option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Tanggal Pesanan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    disabled={isReadOnly || false}
                    className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2.5 pl-3 pr-10 bg-white disabled:bg-slate-100 disabled:opacity-75"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Gudang Tujuan{' '}
                  <span className="text-gray-400 font-normal lowercase">(Opsional UI)</span>
                </label>
                <select
                  disabled={isReadOnly || false}
                  className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 bg-white disabled:bg-slate-100 disabled:opacity-75"
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
            </div>
          </div>

          {/* SECTION 2: Daftar Produk */}
          <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">DAFTAR PRODUK</h2>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="text-sm text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-800 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Tambah Baris
                </button>
              )}
            </div>

            <div className="p-6 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-wrap md:flex-nowrap items-start gap-4"
                >
                  <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="text-xs font-bold text-slate-600">PRODUK</label>
                    <select
                      disabled={isReadOnly || false}
                      className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 bg-white disabled:bg-slate-200/50"
                      value={item.variant_id}
                      onChange={(e) => {
                        if (e.target.value === 'ADD_NEW') setShowProductModal(true);
                        else handleItemChange(item.id, 'variant_id', e.target.value);
                      }}
                    >
                      <option value={0}>--Pilih Produk--</option>
                      {products.map((p) => {
                        if (!p.has_variants) {
                          const variant = p.variants?.[0];
                          if (!variant) return null;
                          return (
                            <option key={variant.variant_id} value={variant.variant_id}>
                              {p.name}
                            </option>
                          );
                        } else {
                          return (
                            <optgroup key={p.product_id} label={p.name}>
                              {p.variants?.map((v) => (
                                <option key={v.variant_id} value={v.variant_id}>
                                  {p.name} - {v.name}
                                </option>
                              ))}
                            </optgroup>
                          );
                        }
                      })}
                      {!isReadOnly && (
                        <>
                          <option disabled>──────────</option>
                          <option value="ADD_NEW" className="text-blue-600 font-semibold">
                            + Tambah Produk Baru
                          </option>
                        </>
                      )}
                    </select>
                    {/* Find currently selected product to show stock */}
                    {item.variant_id !== 0 && (
                      <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-1">
                        <Store className="w-3 h-3" />
                        Stok total saat ini:
                        <span className="text-blue-600">
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

                  <div className="w-24 space-y-2">
                    <label className="text-xs font-bold text-slate-600">QTY</label>
                    <input
                      type="number"
                      min="1"
                      disabled={isReadOnly || false}
                      className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 bg-white disabled:bg-slate-200/50"
                      value={item.qty_ordered}
                      onChange={(e) => handleItemChange(item.id, 'qty_ordered', e.target.value)}
                    />
                  </div>

                  <div className="flex-1 min-w-[120px] space-y-2">
                    <label className="text-xs font-bold text-slate-600">Harga Beli (IDR)</label>
                    <input
                      type="number"
                      disabled={isReadOnly || false}
                      className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 bg-white text-right font-medium disabled:bg-slate-200/50"
                      value={item.price_buy}
                      onChange={(e) => handleItemChange(item.id, 'price_buy', e.target.value)}
                    />
                  </div>

                  <div className="flex-1 min-w-[120px] space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase">Subtotal</label>
                    <div className="py-2.5 px-3 text-sm font-bold text-slate-800 tracking-wide text-right">
                      {formatRupiah(
                        (Number(item.qty_ordered) || 0) * (Number(item.price_buy) || 0),
                      )}
                    </div>
                  </div>

                  {!isReadOnly && (
                    <div className="pt-7">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(item.id)}
                        className="p-2 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-800 tracking-wide">RINGKASAN BIAYA</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
                  <span>Total Jenis Item</span>
                  <span className="text-slate-900">{items.length} Produk</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-600 border-b border-slate-100 pb-4">
                  <span>Total Qty</span>
                  <span className="text-slate-900">{totalItems} pcs</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold text-slate-900">Grand Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-800 tracking-wide">CATATAN TAMBAHAN</h2>
              </div>
              <div className="p-6">
                <textarea
                  disabled={isReadOnly || false}
                  className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-4 bg-white min-h-[128px] resize-y disabled:bg-slate-100"
                  placeholder="Misal: Harap dikirim pagi hari karena toko sibuk sore..."
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
        title="Konfirmasi Pembaruan Pesanan"
        icon={<Package className="w-6 h-6 text-teal-600" />}
        description="Harap periksa kembali detail pesanan pembelian yang ter-update sebelum disimpan."
      >
        <div className="p-6 space-y-6">
          <div className="flex bg-slate-50 rounded-lg border border-slate-100 p-4 divide-x divide-slate-200">
            <div className="flex-1 pr-4">
              <p className="text-xs text-slate-500 font-bold mb-1">SUPPLIER</p>
              <p className="text-sm font-semibold text-slate-900">
                {selectedSupplier?.name || '-'}
              </p>
            </div>
            <div className="flex-1 px-4">
              <p className="text-xs text-slate-500 font-bold mb-1">GUDANG TUJUAN</p>
              <p className="text-sm font-semibold text-slate-900">
                {warehouses.find((w) => w.warehouse_id === warehouseId)?.name || 'Semua Gudang'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-3 border-b pb-2">
              RINCIAN PRODUK ({items.length} Baris)
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
                      <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {item.qty_ordered}
                      </div>
                      <p className="truncate font-medium text-slate-800">{productName}</p>
                    </div>
                    <div className="font-bold text-slate-700">
                      {formatRupiah(item.qty_ordered * item.price_buy)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-teal-800 uppercase">Grand Total Pembaruan</p>
              <p className="text-xs text-teal-600/80 mt-0.5">
                Mengupdate {originalPo?.status === 'OPEN' ? 'OPEN' : 'DRAFT'} Purchase Order.
              </p>
            </div>
            <p className="text-xl font-black text-teal-700">{formatRupiah(grandTotal)}</p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            className="px-4 py-2 rounded-lg font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => setShowConfirmModal(false)}
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => handleSubmit('OPEN')}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Memproses...' : 'Simpan Perubahan'}
          </button>
        </div>
      </Modal>

      {/* --- ADD NEW SUPPLIER INJECTION --- */}
      <Modal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        title="Tambah Supplier Baru (Quick)"
      >
        <div className="p-6">
          {showSupplierModal && (
            <SupplierForm
              onSubmit={async (data) => {
                try {
                  const newSupplier = await supplierService.createSupplier(data);
                  setSuppliers([newSupplier, ...suppliers]);
                  setSupplierId(newSupplier.supplier_id);
                  setShowSupplierModal(false);
                  setNotification({
                    type: 'success',
                    message: 'Supplier baru berhasil ditambahkan.',
                  });
                } catch (e: unknown) {
                  const err = e as { response?: { data?: { message?: string } } };
                  setNotification({
                    type: 'error',
                    message: err.response?.data?.message || 'Gagal menambah supplier.',
                  });
                }
              }}
              onCancel={() => setShowSupplierModal(false)}
            />
          )}
        </div>
      </Modal>

      {/* --- ADD NEW PRODUCT INJECTION --- */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Tambah Produk Baru (Quick)"
      >
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {showProductModal && (
            <ProductForm
              onSubmit={async (data) => {
                try {
                  await productService.createProduct(data);
                  await fetchAllData();
                  setShowProductModal(false);
                  setNotification({
                    type: 'success',
                    message: 'Produk & Varian berhasil ditambahkan. Silakan pilih di menu.',
                  });
                } catch (e: unknown) {
                  const err = e as { response?: { data?: { message?: string } } };
                  setNotification({
                    type: 'error',
                    message: err.response?.data?.message || 'Gagal menambah produk.',
                  });
                }
              }}
              onCancel={() => setShowProductModal(false)}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
