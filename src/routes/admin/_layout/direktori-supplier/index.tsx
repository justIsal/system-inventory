import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useMemo } from 'react';

export const Route = createFileRoute('/admin/_layout/direktori-supplier/')({
  component: RouteComponent,
})

// --- TYPES ---
interface Spec {
  key: string;
  value: string;
}

interface VariantOption {
  id: number;
  name: string; // misal: "Warna"
  values: string; // misal: "Hitam, Putih"
}

interface GeneratedVariant {
  combination: string;
  sku: string;
  price: number;
  stock: number;
}

function RouteComponent() {
  const [isOpen, setIsOpen] = useState(true); // Default open for prototype
  const [hasVariants, setHasVariants] = useState(false);
  
  // State for Dynamic Specs (JSON)
  const [specs, setSpecs] = useState<Spec[]>([{ key: '', value: '' }]);
  
  // State for Variants
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([
    { id: 1, name: 'Warna', values: 'Hitam, Putih' },
    { id: 2, name: 'Ukuran', values: 'M, L, XL' }
  ]);

  // --- LOGIC: Variant Auto-Generator (Cartesian Product) ---
  const generatedVariants = useMemo(() => {
    if (!hasVariants || variantOptions.length === 0) return [];

    const validOptions = variantOptions
      .map(opt => ({
        name: opt.name,
        values: opt.values.split(',').map(v => v.trim()).filter(v => v !== '')
      }))
      .filter(opt => opt.values.length > 0 && opt.name !== '');

    if (validOptions.length === 0) return [];

    const combine = (acc: string[], idx: number): string[] => {
      if (idx === validOptions.length) return acc;
      const currentValues = validOptions[idx].values;
      if (acc.length === 0) return combine(currentValues, idx + 1);
      
      const newAcc: string[] = [];
      acc.forEach(existing => {
        currentValues.forEach(val => {
          newAcc.push(`${existing} - ${val}`);
        });
      });
      return combine(newAcc, idx + 1);
    };

    const combinations = combine([], 0);
    
    return combinations.map(comb => ({
      combination: comb,
      sku: '',
      price: 0,
      stock: 0
    }));
  }, [hasVariants, variantOptions]);

  // --- HANDLERS ---
  const handleAddSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  const handleSpecChange = (index: number, field: keyof Spec, val: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };

  const handleAddVariantOption = () => {
    setVariantOptions([...variantOptions, { id: Date.now(), name: '', values: '' }]);
  };
  const handleVariantChange = (index: number, field: keyof VariantOption, val: string) => {
    const newOpts = [...variantOptions];
    newOpts[index][field] = val as never;
    setVariantOptions(newOpts);
  };

  if (!isOpen) return <button onClick={() => setIsOpen(true)} className="p-4 bg-blue-600 text-white rounded">Buka Modal Tambah Produk</button>;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex justify-end z-50 font-sans">
      {/* Drawer Container */}
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tambah Master Produk</h2>
            <p className="text-xs text-slate-500 font-medium">Buat identitas produk baru ke dalam katalog database.</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
          
          {/* Section 1: Core Identity + Photo Upload */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2">1. Identitas Utama</h3>
            
            {/* AREA UPLOAD FOTO */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Foto Produk *</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-bold">Klik untuk upload atau drag & drop foto</span>
                <span className="text-[10px] uppercase tracking-wider mt-1 text-slate-400">PNG, JPG up to 5MB</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Nama Produk *</label>
                <input type="text" placeholder="Misal: Kemeja Flanel Erigo" className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              {/* DROPDOWN KATEGORI UPDATED */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Kategori *</label>
                <select className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="">Pilih Kategori...</option>
                  <option value="pakaian">Pakaian & Fashion</option>
                  <option value="kecantikan">Kesehatan & Kecantikan</option>
                  <option value="elektronik">Elektronik & Gadget</option>
                  <option value="rumah_tangga">Alat Rumah Tangga</option>
                  <option value="makanan">Makanan & Minuman</option>
                  <option value="ibu_bayi">Ibu & Bayi</option>
                  <option value="olahraga">Olahraga & Outdoor</option>
                  <option value="otomotif">Otomotif</option>
                  <option value="atk">Alat Tulis & Kantor (ATK)</option>
                  <option value="hobi">Hobi & Koleksi</option>
                  <option value="hewan">Perawatan Hewan (Pet Supplies)</option>
                  <option value="lain_lain">Lain-lain</option>
                </select>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Merek (Opsional)</label>
                <input type="text" placeholder="Misal: Erigo" className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Deskripsi Produk</label>
                <textarea 
                  rows={3} 
                  placeholder="Ceritakan detail produk ini..." 
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 2: Toggles & Behaviours */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2">2. Pengaturan Sistem Logistik</h3>
            <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm font-semibold text-slate-700">Wajib Lacak Tanggal Kadaluarsa (Expired Date) saat Inbound</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm font-semibold text-slate-700">Wajib Scan Serial Number (SN/IMEI) saat Inbound</span>
            </label>
            <div className="pt-2 border-t border-slate-100 mt-2">
              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <input 
                  type="checkbox" 
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" 
                />
                <div>
                  <span className="text-sm font-bold text-blue-900 block">Produk ini memiliki Varian</span>
                  <span className="text-[10px] text-blue-700">Pilih ini jika produk memiliki warna, ukuran, atau tipe yang berbeda-beda.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3A: No Variants (Single Product) */}
          {!hasVariants && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5 animate-fade-in">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">3. Detail SKU & Harga (Produk Tunggal)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">SKU Utama *</label>
                  <input type="text" placeholder="KEM-FLN-001" className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none uppercase font-mono" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Barcode / UPC</label>
                  <input type="text" placeholder="899123..." className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none font-mono" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Satuan (UoM) *</label>
                  <select className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none bg-white">
                    <option>Pcs</option><option>Box</option><option>Set</option><option>Kg</option><option>Gram</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Min. Stok Alert</label>
                  <input type="number" placeholder="10" className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Harga Beli Dasar</label>
                  <input type="number" placeholder="Rp" className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Harga Jual Dasar</label>
                  <input type="number" placeholder="Rp" className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Berat (Gram)</label>
                  <input type="number" placeholder="500" className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none" />
                </div>
              </div>

              {/* Dynamic Specifications (JSON) */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Spesifikasi Tambahan (Opsional)</h4>
                  <button onClick={handleAddSpec} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-colors">+ Tambah Baris</button>
                </div>
                {specs.map((spec, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" placeholder="Nama Label (Misal: Bahan)" value={spec.key} onChange={(e) => handleSpecChange(idx, 'key', e.target.value)} className="flex-1 p-2.5 text-sm border border-slate-300 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                    <input type="text" placeholder="Nilai (Misal: Katun)" value={spec.value} onChange={(e) => handleSpecChange(idx, 'value', e.target.value)} className="flex-1 p-2.5 text-sm border border-slate-300 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3B: Has Variants */}
          {hasVariants && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5 animate-fade-in border-l-4 border-l-blue-500">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">3. Generator Varian Produk</h3>
              
              {/* Variant Configurator */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <div className="mb-4 pb-4 border-b border-slate-200">
                  <label className="text-[10px] font-bold text-blue-600 uppercase mb-1 block">Satuan Dasar Varian (UoM) *</label>
                  <select className="w-1/3 p-2.5 text-sm border border-slate-300 rounded-lg outline-none bg-white">
                    <option>Pcs</option><option>Box</option><option>Set</option><option>Kg</option><option>Gram</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">Berlaku untuk semua SKU Anak di bawah ini.</p>
                </div>

                {variantOptions.map((opt, idx) => (
                  <div key={opt.id} className="flex gap-3 items-start">
                    <div className="w-1/3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Tipe Varian</label>
                      <input type="text" value={opt.name} onChange={(e) => handleVariantChange(idx, 'name', e.target.value)} placeholder="Misal: Warna" className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Nilai (Pisahkan dengan koma)</label>
                      <input type="text" value={opt.values} onChange={(e) => handleVariantChange(idx, 'values', e.target.value)} placeholder="Hitam, Putih, Merah" className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none font-mono text-blue-600 focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                ))}
                <button onClick={handleAddVariantOption} className="text-xs font-bold text-slate-600 bg-white border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-100 transition-colors">+ Tambah Tipe Varian</button>
              </div>

              {/* Generated Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-800 text-white">
                    <tr>
                      <th className="p-3 text-[10px] uppercase font-bold tracking-wider">Kombinasi Varian</th>
                      <th className="p-3 text-[10px] uppercase font-bold tracking-wider w-32">SKU Anak *</th>
                      <th className="p-3 text-[10px] uppercase font-bold tracking-wider w-32">Barcode</th>
                      <th className="p-3 text-[10px] uppercase font-bold tracking-wider w-24">Harga Beli</th>
                      <th className="p-3 text-[10px] uppercase font-bold tracking-wider w-24">Harga Jual</th>
                      <th className="p-3 text-[10px] uppercase font-bold tracking-wider w-20">Berat(gr)</th>
                      <th className="p-3 text-[10px] uppercase font-bold tracking-wider w-20">Min Stok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {generatedVariants.length === 0 ? (
                      <tr><td colSpan={7} className="p-4 text-center text-slate-400 text-xs italic">Ketik nilai varian di atas untuk menghasilkan daftar SKU otomatis...</td></tr>
                    ) : (
                      generatedVariants.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-bold text-slate-700">{v.combination}</td>
                          <td className="p-2"><input type="text" placeholder={`SKU-${i+1}`} className="w-full p-2 text-xs border border-slate-300 rounded outline-none uppercase font-mono focus:border-blue-500" /></td>
                          <td className="p-2"><input type="text" placeholder="Barcode" className="w-full p-2 text-xs border border-slate-300 rounded outline-none font-mono focus:border-blue-500" /></td>
                          <td className="p-2"><input type="number" placeholder="Rp" className="w-full p-2 text-xs border border-slate-300 rounded outline-none focus:border-blue-500" /></td>
                          <td className="p-2"><input type="number" placeholder="Rp" className="w-full p-2 text-xs border border-slate-300 rounded outline-none focus:border-blue-500" /></td>
                          <td className="p-2"><input type="number" placeholder="Gram" className="w-full p-2 text-xs border border-slate-300 rounded outline-none focus:border-blue-500" /></td>
                          <td className="p-2"><input type="number" placeholder="Min" defaultValue="0" className="w-full p-2 text-xs border border-slate-300 rounded outline-none focus:border-blue-500" /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <button onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Batal</button>
          <button className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">Simpan Katalog Produk</button>
        </div>

      </div>
    </div>
  );
}