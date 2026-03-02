import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { productService } from '@/services/api/productService';
import type { Product } from '@/types/product.types';
import { ArrowLeft, Edit, Printer, Package, AlertCircle, Tag, Wallet } from 'lucide-react';
import { formatRupiah } from '@/utils/format';
import { exportToCSV } from '@/utils/export';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';
import { ProductForm } from '@/components/organisms/ProductForm';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';

export const Route = createFileRoute(
  '/admin/_layout/katalog-produk/$productId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { productId } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await productService.getProductById(productId);
        setProduct(data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Gagal memuat data produk.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  // Handle temporary routing back
  const handleBack = () => {
      window.history.back();
  };

  const handleUpdateProduct = async (data: any) => {
    setIsSubmitting(true);
    try {
      await productService.updateProduct(productId, data);
      setIsEditModalOpen(false);
      
      // refresh product data
      const updated = await productService.getProductById(productId);
      setProduct(updated);
      alert('Produk berhasil diperbarui.');
    } catch (error: any) {
      console.error('Failed to update product:', error);
      alert(error.response?.data?.message || 'Gagal memperbarui produk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintLabel = () => {
      window.print();
  };

  const handleExportData = () => {
      const movements = variant?.movements || [];
      exportToCSV(movements, `Riwayat_Mutasi_${variant?.sku || productId}`, [
          { key: (m) => new Date(m.created_at).toLocaleString('id-ID'), label: 'Waktu' },
          { key: 'type', label: 'Tipe' },
          { key: (m) => m.warehouse?.name || '-', label: 'Gudang' },
          { key: 'quantity', label: 'Jumlah' },
          { key: (m) => m.reference || '-', label: 'Referensi' },
          { key: (m) => m.user?.username || 'System', label: 'Oleh' }
      ]);
  };

  if (isLoading) {
    return (
        <div className="h-full flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Memuat Data Master Produk...</p>
            </div>
        </div>
    )
  }

  if (error || !product) {
       return (
           <div className="h-full flex items-center justify-center min-h-[400px]">
               <div className="flex flex-col items-center bg-red-50 p-8 rounded-2xl border border-red-100 max-w-md text-center">
                   <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                   <h2 className="text-xl font-black text-red-700 mb-2">Produk Tidak Ditemukan</h2>
                   <p className="text-sm text-red-600/80 mb-6">{error || 'Data yang Anda cari mungkin telah dihapus.'}</p>
                   <button onClick={handleBack} className="px-5 py-2.5 text-sm font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition-colors">
                       Kembali ke Katalog
                   </button>
               </div>
           </div>
       )
  }

  // Calculate Metrics from nested arrays (Assuming Single Variant for prototype)
  const variant = product?.variants?.[0]; // Taking the primary variant for now based on Figma assuming 1 master layout
  
  const totalStock = product?.variants?.reduce((acc, v) => acc + (v.stocks?.reduce((sAcc, s) => sAcc + s.quantity, 0) || 0), 0) || 0;
  const minStock = variant?.min_stock || 0;
  const buyPrice = variant?.price_buy || 0;
  const totalValue = totalStock * buyPrice;

  return (
    <>
      {/* =========================================
          SCREEN LAYOUT (Hidden on Print)
          ========================================= */}
      <div className="h-full flex flex-col font-sans space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500 pb-12 print:hidden">
        
        <Breadcrumbs 
            items={[
                { label: 'Dashboard', path: '/admin' },
                { label: 'Katalog Produk', path: '/admin/katalog-produk' },
                { label: 'Detail Produk' }
            ]} 
        />

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
                <Button onClick={handleBack} className="!w-auto !p-2 !bg-white !text-slate-500 !border !border-slate-200 hover:!bg-slate-50 hover:!text-blue-600 shadow-sm mt-1">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        {product?.name || 'Laptop ASUS Vivobook'}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                            {variant?.sku || `PROD-${productId}`}
                        </span>
                        {product?.default_supplier?.name && (
                             <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                 Supplier: {product.default_supplier.name}
                             </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="!w-auto flex items-center gap-2 !px-5 !py-2.5 !text-sm !font-bold !text-white !bg-blue-600 !rounded-lg !shadow-md shadow-blue-200 hover:!bg-blue-700 transition-all active:scale-95"
                >
                    <Edit className="w-4 h-4" /> Edit Produk
                </Button>
                <Button 
                    onClick={handlePrintLabel}
                    className="!w-auto flex items-center gap-2 !px-5 !py-2.5 !text-sm !font-bold !text-slate-700 !bg-white border border-slate-300 !rounded-lg hover:!bg-slate-50 transition-all shadow-sm"
                >
                    <Printer className="w-4 h-4" /> Cetak Label
                </Button>
            </div>
        </div>

        {/* METRIC CARDS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Total Stok */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-bold text-slate-500">Total Stok Saat Ini</h3>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                        <Package className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-3xl font-black text-slate-800">{totalStock}</p>
            </div>

            {/* Card 2: Minimum Stok */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-bold text-slate-500">Minimum Stok</h3>
                    <div className="p-2 bg-red-50 text-red-500 rounded-lg group-hover:scale-110 transition-transform">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-3xl font-black text-slate-800">{minStock}</p>
            </div>

            {/* Card 3: Harga Beli */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-400"></div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-bold text-slate-500">Harga Beli Dasar</h3>
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                        <Tag className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-black text-slate-800 mt-2">{formatRupiah(buyPrice)}</p>
            </div>

            {/* Card 4: Total Nilai Stok */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500"></div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-bold text-slate-500">Total Nilai Stok</h3>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:scale-110 transition-transform">
                        <Wallet className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-black text-slate-800 mt-2">{formatRupiah(totalValue)}</p>
            </div>
        </div>

        {/* TBD: TABLES SECTION */}
        <div className="space-y-10 pt-4">
             {/* Tabel Sebaran Gudang Placeholder */}
             <div>
                <h3 className="text-[13px] font-black text-slate-500 uppercase tracking-widest mb-4">Sebaran Stok Per Gudang</h3>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                                <th className="py-3 px-6">Nama Gudang</th>
                                <th className="py-3 px-6">Lokasi</th>
                                <th className="py-3 px-6 text-right">Jumlah Stok</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {variant?.stocks && variant.stocks.length > 0 ? (
                                variant.stocks.map((stock, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-semibold text-slate-700">
                                            {stock.warehouse?.name || 'Gudang Utama'}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-500">
                                            {stock.warehouse?.location || 'Lokasi Tidak Diketahui'}
                                        </td>
                                        <td className="py-4 px-6 text-sm font-black text-slate-800 text-right">
                                            {stock.quantity}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="py-8 text-center text-sm text-slate-400">
                                        Belum ada alokasi stok di gudang manapun.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
             </div>

             {/* Tabel Riwayat Mutasi Placeholder */}
             <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                     <h3 className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Riwayat Mutasi</h3>
                     <div className="flex items-center gap-3">
                         <Button 
                             onClick={handleExportData}
                             className="!w-auto flex items-center gap-2 !px-3 !py-1.5 !text-[13px] !font-semibold !text-blue-600 !bg-blue-50 hover:!bg-blue-100 !rounded-md transition-colors"
                         >
                             <Printer className="w-4 h-4" /> Export Data
                         </Button>
                         <Button className="!w-auto flex items-center gap-2 !px-3 !py-1.5 !text-[13px] !font-semibold !text-slate-600 !bg-slate-100 hover:!bg-slate-200 !rounded-md transition-colors">
                             <AlertCircle className="w-4 h-4" /> Filter
                         </Button>
                     </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-100/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                                    <th className="py-3 px-6 w-12 text-center">
                                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                    </th>
                                    <th className="py-3 px-4">Waktu</th>
                                    <th className="py-3 px-4 text-center">Tipe</th>
                                    <th className="py-3 px-4">Gudang</th>
                                    <th className="py-3 px-4">Jumlah</th>
                                    <th className="py-3 px-4">Referensi</th>
                                    <th className="py-3 px-4">Oleh</th>
                                    <th className="py-3 px-4 text-right">Sisa Stok</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {variant?.movements && variant.movements.length > 0 ? (
                                    variant.movements.map((mov, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6 text-center">
                                                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                            </td>
                                            <td className="py-4 px-4 text-[13px] font-medium text-slate-600">
                                                {new Date(mov.created_at).toLocaleString('id-ID', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                                                    mov.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {mov.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-[13px] text-slate-600">
                                                {mov.warehouse?.name || '-'}
                                            </td>
                                            <td className={`py-4 px-4 text-sm font-bold ${
                                                mov.type === 'IN' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {mov.type === 'IN' ? '+' : '-'}{mov.quantity}
                                            </td>
                                            <td className="py-4 px-4 text-[13px] text-slate-500 font-mono">
                                                {mov.reference || '-'}
                                            </td>
                                            <td className="py-4 px-4 text-[13px] text-slate-600">
                                                {mov.user?.username || 'System'}
                                            </td>
                                            <td className="py-4 px-4 text-sm font-black text-slate-800 text-right">
                                                {/* Requires running balance calculation, fallback to raw for now */}
                                                -
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-sm text-slate-400">
                                            Belum ada riwayat pergerakan stok (Mutasi).
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
             </div>
        </div>

        {/* Edit Product Modal */}
        <Modal 
            isOpen={isEditModalOpen} 
            onClose={() => { if (!isSubmitting) setIsEditModalOpen(false); }}
            title="Edit Produk"
            icon={<Edit className="h-5 w-5" />}
        >
            {product && (
                <ProductForm 
                    initialData={product}
                    onSubmit={handleUpdateProduct} 
                    onCancel={() => setIsEditModalOpen(false)} 
                    isSubmitting={isSubmitting}
                />
            )}
        </Modal>
      </div>

      {/* =========================================
          PRINT LAYOUT (Only visible on Print)
          ========================================= */}
      <div className="hidden print:block bg-white text-black font-sans w-full">
          {/* Header Surat Laporan */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-end">
              <div>
                  <h1 className="text-2xl font-black uppercase tracking-widest">Laporan Data Produk</h1>
                  <p className="text-sm text-slate-500 mt-1">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
              </div>
              <div className="text-right">
                  <Package className="w-10 h-10 text-slate-300 ml-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400">SYSTEM INVENTORY</p>
              </div>
          </div>

          {/* Identitas Produk */}
          <div className="mb-8 p-4 border border-slate-300 rounded-md bg-slate-50/50">
              <h2 className="text-2xl font-bold mb-2">{product?.name}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <div>
                      <span className="text-slate-500 block text-xs uppercase font-bold mb-1">SKU Induk</span>
                      <span className="font-mono">{variant?.sku || `PROD-${productId}`}</span>
                  </div>
                  <div>
                      <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Kategori</span>
                      <span>{product?.category?.name || '-'}</span>
                  </div>
                  <div>
                      <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Supplier Default</span>
                      <span>{product?.default_supplier?.name || '-'}</span>
                  </div>
                  <div>
                      <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Status Varian</span>
                      <span>{product?.has_variants ? 'Multi Varian' : 'Tunggal'}</span>
                  </div>
              </div>
          </div>

          {/* Metrik Utama */}
          <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="border border-slate-300 p-3 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Total Stok</span>
                  <span className="text-xl font-black">{totalStock}</span>
              </div>
              <div className="border border-slate-300 p-3 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Min Stok</span>
                  <span className="text-xl font-black">{minStock}</span>
              </div>
              <div className="border border-slate-300 p-3 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Harga Beli</span>
                  <span className="text-lg font-bold">{formatRupiah(buyPrice)}</span>
              </div>
              <div className="border border-slate-300 p-3 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Nilai Aset Stok</span>
                  <span className="text-lg font-bold">{formatRupiah(totalValue)}</span>
              </div>
          </div>

          {/* Sebaran Gudang (Print) */}
          <div className="mb-8">
             <h3 className="text-sm font-bold uppercase border-b border-slate-300 pb-2 mb-3">Sebaran Stok Per Gudang</h3>
             <table className="w-full text-left text-sm border-collapse">
                 <thead>
                     <tr className="bg-slate-100 border-y border-slate-300">
                         <th className="py-2 px-3">Gudang</th>
                         <th className="py-2 px-3">Lokasi</th>
                         <th className="py-2 px-3 text-right">Qty</th>
                     </tr>
                 </thead>
                 <tbody>
                     {variant?.stocks && variant.stocks.length > 0 ? (
                         variant.stocks.map((stock, idx) => (
                             <tr key={idx} className="border-b border-slate-200">
                                 <td className="py-2 px-3">{stock.warehouse?.name}</td>
                                 <td className="py-2 px-3 text-slate-600">{stock.warehouse?.location}</td>
                                 <td className="py-2 px-3 text-right font-bold">{stock.quantity}</td>
                             </tr>
                         ))
                     ) : (
                         <tr><td colSpan={3} className="py-4 text-center italic text-slate-500">Tidak ada alokasi gudang.</td></tr>
                     )}
                 </tbody>
             </table>
          </div>

          {/* Riwayat Mutasi (Print) */}
          <div className="mb-8">
             <h3 className="text-sm font-bold uppercase border-b border-slate-300 pb-2 mb-3">Rekap Riwayat Mutasi</h3>
             <table className="w-full text-left text-xs border-collapse">
                 <thead>
                     <tr className="bg-slate-100 border-y border-slate-300">
                         <th className="py-2 px-2">Waktu</th>
                         <th className="py-2 px-2">Tipe</th>
                         <th className="py-2 px-2">Gudang</th>
                         <th className="py-2 px-2">Jumlah</th>
                         <th className="py-2 px-2">Referensi</th>
                         <th className="py-2 px-2">Oleh</th>
                     </tr>
                 </thead>
                 <tbody>
                     {variant?.movements && variant.movements.length > 0 ? (
                         variant.movements.map((mov, idx) => (
                             <tr key={idx} className="border-b border-slate-200">
                                 <td className="py-2 px-2">{new Date(mov.created_at).toLocaleDateString()}</td>
                                 <td className="py-2 px-2 font-bold">{mov.type}</td>
                                 <td className="py-2 px-2">{mov.warehouse?.name}</td>
                                 <td className="py-2 px-2 text-right">{mov.type === 'IN' ? '+' : '-'}{mov.quantity}</td>
                                 <td className="py-2 px-2 font-mono">{mov.reference || '-'}</td>
                                 <td className="py-2 px-2">{mov.user?.username}</td>
                             </tr>
                         ))
                     ) : (
                         <tr><td colSpan={6} className="py-4 text-center italic text-slate-500">Belum ada mutasi stok terdata.</td></tr>
                     )}
                 </tbody>
             </table>
          </div>
          
          <div className="mt-12 text-center text-[10px] text-slate-400">
              Dokumen ini dihasilkan secara otomatis oleh sistem. Validasi fisik mungkin diperlukan.
          </div>
      </div>
    </>
  )
}
