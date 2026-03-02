import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
import { Input } from '@/components/atoms/Input';
import { ModalFormLayout } from '@/components/molecules/ModalFormLayout';
import { Modal } from '@/components/molecules/Modal';
import { SupplierForm } from './SupplierForm';
import { supplierService, type Supplier } from '@/services/api/supplierService';
import { Plus, UserPlus, ImagePlus } from 'lucide-react';
import { Alert } from '@/components/molecules/Alert';
import type { Product } from '@/types/product.types';
import { apiClient } from '@/services/apiClient';
import { API_ROUTES } from '@/services/endpoints';

// Categories fetched from backend or static map
interface Category {
    category_id: number;
    name: string;
}

const productVariantSchema = z.object({
    variant_id: z.number().optional(), // For Edit updates
    sku: z.string().min(1, 'SKU wajib'),
    barcode: z.string().optional(),
    name: z.string().optional(),
    unit: z.string().min(1, 'Satuan wajib'),
    weight_gram: z.coerce.number().int().nonnegative().optional(),
    min_stock: z.coerce.number().int().nonnegative().optional(),
    price_buy: z.coerce.number().nonnegative(),
    price_sell: z.coerce.number().nonnegative(),
    specifications: z.record(z.any()).optional()
});

const productSchema = z.object({
    category_id: z.coerce.number().int().positive('Kategori wajib dipilih'),
    default_supplier_id: z.coerce.number().int().positive().optional(),
    name: z.string().min(1, 'Nama produk wajib diisi'),
    brand: z.string().optional(),
    description: z.string().optional(),
    photo_url: z.string().optional(),
    has_variants: z.boolean().default(false),
    track_expiry: z.boolean().default(false),
    track_sn: z.boolean().default(false),
    variants: z.array(productVariantSchema).min(1, 'Minimal 1 varian atau SKU wajib ada')
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// Sub-interfaces for dynamic state
interface Spec { key: string; value: string; }
interface VariantOption { id: number; name: string; values: string; }
interface GeneratedVariant { variant_id?: number; combination: string; sku: string; barcode: string; price_buy: number; price_sell: number; weight_gram: number; min_stock: number; }

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
    
    // Generate default values based on whether we are creating or editing
    const generateDefaultValues = (): ProductFormValues => {
      if (initialData) {
        return {
          name: initialData.name,
          category_id: initialData.category_id,
          default_supplier_id: initialData.default_supplier_id || undefined,
          brand: initialData.brand || undefined,
          description: initialData.description || undefined,
          photo_url: initialData.photo_url || undefined,
          has_variants: initialData.has_variants,
          track_expiry: initialData.track_expiry,
          track_sn: initialData.track_sn,
          variants: initialData.variants?.map(v => ({
            variant_id: (v as any).variant_id, // Map the backend ID for updates
            sku: v.sku,
            barcode: v.barcode || undefined,
            name: v.name || undefined,
            price_buy: v.price_buy,
            price_sell: v.price_sell,
            unit: v.unit,
            weight_gram: v.weight_gram || undefined,
            min_stock: v.min_stock || undefined,
            specifications: (v as any).specifications || undefined
          })) || []
        };
      }
      return {
          category_id: 0,
          default_supplier_id: undefined,
          name: '',
          brand: '',
          description: '',
          photo_url: '',
          has_variants: false,
          track_expiry: false,
          track_sn: false,
          variants: [{
              sku: '', barcode: '', unit: 'Pcs', price_buy: 0, price_sell: 0, weight_gram: 0, min_stock: 0
          }]
      };
    };

    // Basic Form Setup with initial generic values
    const form = useForm<any>({
        defaultValues: generateDefaultValues(),
        validatorAdapter: zodValidator() as any,
        onSubmit: async ({ value }) => {
            // TanStack form doesn't automatically mutate the submitted payload with Zod coercions.
            // We must explicitly parse the raw form JSON through Zod to apply the string->number coercions
            // before sending it to the parent handler and API.
            try {
                const parsedValue = productSchema.parse(value);
                await onSubmit(parsedValue);
            } catch (err: any) {
                console.error("Payload Parse Error Caught Before Submission:", err);
                throw err;
            }
        },
    });

    const hasVariants = form.state.values.has_variants;

    // Figure out starting options if Editing
    const calculateInitialVariantOptions = (): VariantOption[] => {
        if (!initialData || !initialData.has_variants || !initialData.variants) return [
            { id: 1, name: 'Warna', values: '' },
            { id: 2, name: 'Ukuran', values: '' }
        ];

        // Reverse engineer specifications from variants to repopulate the Generator Type fields
        const allSpecs: Record<string, Set<string>> = {};
        initialData.variants.forEach(v => {
            const specs = (v as any).specifications || {};
            Object.entries(specs).forEach(([key, val]) => {
                if (!allSpecs[key]) allSpecs[key] = new Set();
                allSpecs[key].add(val as string);
            });
        });

        const extracted = Object.keys(allSpecs).map((key, i) => ({
            id: Date.now() + i,
            name: key,
            values: Array.from(allSpecs[key]).join(', ')
        }));
        
        return extracted.length > 0 ? extracted : [{ id: 1, name: 'Variasi', values: '' }];
    };

    // Dynamic State for Single/Variants UI Configuration
    const [globalUnit, setGlobalUnit] = useState(initialData?.variants?.[0]?.unit || 'Pcs');
    const [specs, setSpecs] = useState<Spec[]>([{ key: '', value: '' }]);
    const [variantOptions, setVariantOptions] = useState<VariantOption[]>(calculateInitialVariantOptions());
    const [generatedTable, setGeneratedTable] = useState<GeneratedVariant[]>([]);

    // API Data Data
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isFetchingDeps, setIsFetchingDeps] = useState(false);
    
    // Nested Modals
    const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
    const [isSubmittingSupplier, setIsSubmittingSupplier] = useState(false);
    const [nestedNotification, setNestedNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Initialization Fetch
    useEffect(() => {
        setIsFetchingDeps(true);
        Promise.all([
            apiClient.get(API_ROUTES.CATEGORIES.BASE),
            supplierService.getSuppliers(1, 100)
        ]).then(([catRes, supRes]) => {
            setCategories(catRes.data.data);
            setSuppliers(supRes.data);
        }).catch(console.error);
    }, []);

    // Render Variants on Edit if Has Variants Configuration already exists
    // Auto-Generator Logic only responds if variantOptions is explicitly modified.
    useEffect(() => {
        if (!hasVariants) return;
        const validOptions = variantOptions
            .map(opt => ({ name: opt.name, values: opt.values.split(',').map(v => v.trim()).filter(v => v !== '') }))
            .filter(opt => opt.values.length > 0 && opt.name !== '');

        if (validOptions.length === 0 && !initialData) {
            setGeneratedTable([]);
            form.setFieldValue('variants', []);
            return;
        } else if (validOptions.length === 0 && initialData && initialData.variants) {
            // Restore from API load
            setGeneratedTable(initialData.variants.map(v => ({
                variant_id: (v as any).variant_id, // Map hidden ID
                combination: v.name || v.sku,
                sku: v.sku,
                barcode: v.barcode || '',
                price_buy: v.price_buy,
                price_sell: v.price_sell,
                weight_gram: v.weight_gram || 0,
                min_stock: v.min_stock || 0,
                specs: (v as any).specifications || {}
            })) as any);
            return;
        }

        const combine = (acc: {comb: string, specs: Record<string, string>}[], idx: number): {comb: string, specs: Record<string, string>}[] => {
            if (idx === validOptions.length) return acc;
            const currentOpt = validOptions[idx];
            if (acc.length === 0) return combine(currentOpt.values.map(v => ({ comb: v, specs: { [currentOpt.name]: v } })), idx + 1);
            
            const newAcc: {comb: string, specs: Record<string, string>}[] = [];
            acc.forEach(existing => {
                currentOpt.values.forEach(val => {
                    newAcc.push({
                        comb: `${existing.comb} - ${val}`,
                        specs: { ...existing.specs, [currentOpt.name]: val }
                    });
                });
            });
            return combine(newAcc, idx + 1);
        };

        const combinations = combine([], 0);
        
        // Preserve existing data in table if combination matches
        const newTable = combinations.map(c => {
            const existing = generatedTable.find(gt => gt.combination === c.comb);
            return existing ? existing : { combination: c.comb, sku: '', barcode: '', price_buy: 0, price_sell: 0, weight_gram: 0, min_stock: 0, specs: c.specs };
        });
        
        setGeneratedTable(newTable as any);

        // Sync to Form Store
        form.setFieldValue('variants', newTable.map(t => ({
            ...t,
            unit: globalUnit,
            name: t.combination,
            specifications: (t as any).specs
        })));
        
    }, [variantOptions, hasVariants, globalUnit]); // Note: intentional exclude generatedTable to avoid infinite loops

    // Handlers
    const handleVariantTableChange = (index: number, field: keyof GeneratedVariant, val: any) => {
        const newTable = [...generatedTable];
        (newTable[index] as any)[field] = val;
        setGeneratedTable(newTable);
        // Sync to form
        const variants = form.getFieldValue('variants');
        variants[index] = { ...variants[index], [field]: val };
        form.setFieldValue('variants', variants);
    };

    const handleCreateSupplier = async (data: any) => {
        setIsSubmittingSupplier(true);
        try {
            const newSupplier = await supplierService.createSupplier(data);
            setNestedNotification({ type: 'success', message: 'Supplier ditambahkan.' });
            const res = await supplierService.getSuppliers(1, 100);
            setSuppliers(res.data);
            form.setFieldValue('default_supplier_id', newSupplier.supplier_id);
            setTimeout(() => { setIsAddSupplierModalOpen(false); setNestedNotification(null); }, 1500);
        } catch (error: any) {
            setNestedNotification({ type: 'error', message: error.response?.data?.message || 'Gagal' });
        } finally {
            setIsSubmittingSupplier(false);
        }
    };

    return (
        <>
            <ModalFormLayout
                onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
                onCancel={onCancel}
                isSubmitting={isSubmitting}
                submitText="Simpan Katalog Produk"
            >
                <div className="space-y-8 bg-slate-50/50 -m-6 p-6">
                    {/* Section 1: Core Identity */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 border-b pb-2">1. Identitas Utama</h3>
                        
                        <div className="mb-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Foto Produk</label>
                            <form.Field name="photo_url">
                                {(field) => (
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-blue-50 transition-colors">
                                        <ImagePlus className="h-10 w-10 mb-2 text-slate-400" />
                                        <span className="text-sm font-bold">Upload fitur segera hadir</span>
                                    </div>
                                )}
                            </form.Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <form.Field name="name" validators={{ onChange: z.string().min(1) }}>
                                {(field) => (
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Nama Produk *</label>
                                        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="Misal: Kemeja Flanel Erigo" error={field.state.meta.errors ? field.state.meta.errors.map((err: any) => typeof err === 'string' ? err : err?.message || 'Wajib diisi').join(', ') : undefined} />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="category_id">
                                {(field) => (
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Kategori *</label>
                                        <select value={field.state.value || ''} onChange={(e) => field.handleChange(Number(e.target.value))} className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none max-h-10">
                                            <option value="" disabled>Pilih Kategori...</option>
                                            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="brand">
                                {(field) => (
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Merek (Opsional)</label>
                                        <Input value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} placeholder="Misal: Erigo" />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="description">
                                {(field) => (
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Deskripsi Produk</label>
                                        <textarea value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} rows={3} placeholder="Ceritakan detail produk..." className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none resize-none"></textarea>
                                    </div>
                                )}
                            </form.Field>
                        </div>
                    </div>

                    {/* Section 2: Behaviours & Links */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 border-b pb-2">2. Pengaturan Operasional & Supplier</h3>
                        
                        <form.Field name="default_supplier_id">
                            {(field) => (
                                <div className="mb-4">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Supplier Utama (Default PO)</label>
                                    <div className="flex gap-2">
                                        <select value={field.state.value || ''} onChange={(e) => field.handleChange(Number(e.target.value))} className="flex-1 p-2.5 text-sm border border-slate-300 rounded-lg outline-none">
                                            <option value="">Tidak ada supplier default</option>
                                            {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
                                        </select>
                                        <button type="button" onClick={() => setIsAddSupplierModalOpen(true)} className="px-3 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4"/> Tambah</button>
                                    </div>
                                </div>
                            )}
                        </form.Field>

                        <div className="space-y-2">
                            <form.Field name="track_expiry">
                                {(field) => (
                                    <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                                        <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                                        <span className="text-sm font-semibold text-slate-700">Wajib Lacak Tanggal Kadaluarsa (Expired Date)</span>
                                    </label>
                                )}
                            </form.Field>
                            <form.Field name="track_sn">
                                {(field) => (
                                    <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                                        <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                                        <span className="text-sm font-semibold text-slate-700">Wajib Scan Serial Number (SN/IMEI)</span>
                                    </label>
                                )}
                            </form.Field>
                        </div>

                        <div className="pt-2 border-t border-slate-100 mt-2">
                            <form.Field name="has_variants">
                                {(field) => (
                                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                        <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                                        <div>
                                            <span className="text-sm font-bold text-blue-900 block">Produk ini memiliki Varian</span>
                                            <span className="text-[10px] text-blue-700">Kemeja berbagai ukuran/warna, dll.</span>
                                        </div>
                                    </label>
                                )}
                            </form.Field>
                        </div>
                    </div>

                    {/* Section 3A: Single Product */}
                    {!hasVariants && (
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5 animate-fade-in">
                            <h3 className="text-sm font-bold text-slate-800 border-b pb-2">3. Detail SKU & Harga (Produk Tunggal)</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <form.Field name="variants[0].sku">
                                    {(field) => (
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">SKU Utama *</label>
                                            <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="SKU-001" className="uppercase font-mono" />
                                        </div>
                                    )}
                                </form.Field>
                                <form.Field name="variants[0].barcode">
                                    {(field) => (
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Barcode / UPC</label>
                                            <Input value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} placeholder="899123..." font-mono />
                                        </div>
                                    )}
                                </form.Field>
                                <form.Field name="variants[0].unit">
                                    {(field) => (
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Satuan (UoM) *</label>
                                            <select value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none bg-white max-h-10">
                                                <option>Pcs</option><option>Box</option><option>Set</option><option>Kg</option><option>Gram</option>
                                            </select>
                                        </div>
                                    )}
                                </form.Field>
                                <form.Field name="variants[0].min_stock">
                                    {(field) => (
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Min. Stok Alert</label>
                                            <Input type="number" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value === '' ? undefined : Number(e.target.value))} placeholder="10" />
                                        </div>
                                    )}
                                </form.Field>
                                <form.Field name="variants[0].price_buy">
                                    {(field) => (
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Harga Beli Dasar</label>
                                            <Input type="number" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value === '' ? 0 : Number(e.target.value))} placeholder="Rp" />
                                        </div>
                                    )}
                                </form.Field>
                                <form.Field name="variants[0].price_sell">
                                    {(field) => (
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Harga Jual Dasar</label>
                                            <Input type="number" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value === '' ? 0 : Number(e.target.value))} placeholder="Rp" />
                                        </div>
                                    )}
                                </form.Field>
                                <form.Field name="variants[0].weight_gram">
                                    {(field) => (
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Berat (Gram)</label>
                                            <Input type="number" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value === '' ? undefined : Number(e.target.value))} placeholder="500" />
                                        </div>
                                    )}
                                </form.Field>
                            </div>

                            {/* Dynamic Specifications (JSON) */}
                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-xs font-bold text-slate-700 uppercase">Spesifikasi Tambahan (Opsional)</h4>
                                    <button type="button" onClick={() => setSpecs([...specs, { key: '', value: '' }])} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-colors">+ Tambah Baris</button>
                                </div>
                                {specs.map((spec, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input type="text" placeholder="Nama Label (Misal: Bahan)" value={spec.key} onChange={(e) => {
                                            const newSpecs = [...specs]; newSpecs[idx].key = e.target.value; setSpecs(newSpecs);
                                        }} className="flex-1 p-2.5 text-sm border border-slate-300 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                                        <input type="text" placeholder="Nilai (Misal: Katun)" value={spec.value} onChange={(e) => {
                                            const newSpecs = [...specs]; newSpecs[idx].value = e.target.value; setSpecs(newSpecs);
                                            // Sync back into Form Variants record if they want to save it
                                            const curVars = form.getFieldValue('variants');
                                            const updatedSpecs = newSpecs.reduce((acc, curr) => {
                                                if(curr.key.trim() !== '') acc[curr.key] = curr.value;
                                                return acc;
                                            }, {} as any);
                                            if(curVars[0]) {
                                                curVars[0].specifications = updatedSpecs;
                                                form.setFieldValue('variants', curVars);
                                            }
                                        }} className="flex-1 p-2.5 text-sm border border-slate-300 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                                        <button type="button" onClick={() => {
                                            if (specs.length > 1) {
                                                const newSpecs = specs.filter((_, i) => i !== idx); setSpecs(newSpecs);
                                                const curVars = form.getFieldValue('variants');
                                                if(curVars[0]) {
                                                    curVars[0].specifications = newSpecs.reduce((acc, curr) => {
                                                        if(curr.key.trim() !== '') acc[curr.key] = curr.value; return acc;
                                                    }, {} as any);
                                                    form.setFieldValue('variants', curVars);
                                                }
                                            }
                                        }} className="p-2 text-slate-400 hover:text-red-500">&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section 3B: Has Variants */}
                    {hasVariants && (
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5 animate-fade-in border-l-4 border-l-blue-500">
                            <h3 className="text-sm font-bold text-slate-800 border-b pb-2">3. Generator Varian Produk</h3>
                            
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                                <div className="mb-4 pb-4 border-b border-slate-200">
                                    <label className="text-[10px] font-bold text-blue-600 uppercase mb-1 block">Satuan Dasar Varian (UoM) *</label>
                                    <select value={globalUnit} onChange={(e) => {
                                        setGlobalUnit(e.target.value);
                                        const newVars = form.getFieldValue('variants').map(v => ({ ...v, unit: e.target.value }));
                                        form.setFieldValue('variants', newVars);
                                    }} className="w-1/3 p-2.5 text-sm border border-slate-300 rounded-lg outline-none bg-white">
                                        <option>Pcs</option><option>Box</option><option>Set</option><option>Kg</option><option>Gram</option>
                                    </select>
                                </div>

                                {variantOptions.map((opt, idx) => (
                                    <div key={opt.id} className="flex gap-3 items-start">
                                        <div className="w-1/3">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Tipe Varian</label>
                                            <input type="text" value={opt.name} onChange={(e) => { const n = [...variantOptions]; n[idx].name = e.target.value; setVariantOptions(n); }} placeholder="Misal: Warna" className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Nilai (Pisahkan koma)</label>
                                            <input type="text" value={opt.values} onChange={(e) => { const n = [...variantOptions]; n[idx].values = e.target.value; setVariantOptions(n); }} placeholder="Hitam, Putih, Merah" className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none font-mono text-blue-600 focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setVariantOptions([...variantOptions, { id: Date.now(), name: '', values: '' }])} className="text-xs font-bold text-slate-600 bg-white border border-slate-300 px-3 py-1.5 rounded">+ Tambah Tipe</button>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-800 text-white">
                                        <tr>
                                            <th className="p-3 text-[10px] uppercase font-bold w-32">Kombinasi</th>
                                            <th className="p-3 text-[10px] uppercase font-bold w-40">SKU Anak *</th>
                                            <th className="p-3 text-[10px] uppercase font-bold w-32">Barcode</th>
                                            <th className="p-3 text-[10px] uppercase font-bold w-24">Harga Beli</th>
                                            <th className="p-3 text-[10px] uppercase font-bold w-24">Harga Jual</th>
                                            <th className="p-3 text-[10px] uppercase font-bold w-20">Berat(g)</th>
                                            <th className="p-3 text-[10px] uppercase font-bold w-20">Min Stok</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {generatedTable.length === 0 ? (
                                            <tr><td colSpan={7} className="p-4 text-center text-slate-400 text-xs italic">Ketik nilai varian di atas...</td></tr>
                                        ) : (
                                            generatedTable.map((v, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="p-3 font-bold text-slate-700">{v.combination}</td>
                                                    <td className="p-2"><input type="text" value={v.sku} onChange={(e) => handleVariantTableChange(i, 'sku', e.target.value)} placeholder={`SKU-${i+1}`} className="w-full p-2 text-xs border border-slate-300 rounded uppercase font-mono" /></td>
                                                    <td className="p-2"><input type="text" value={v.barcode} onChange={(e) => handleVariantTableChange(i, 'barcode', e.target.value)} placeholder="Barcode" className="w-full p-2 text-xs border border-slate-300 rounded font-mono" /></td>
                                                    <td className="p-2"><input type="number" value={v.price_buy || ''} onChange={(e) => handleVariantTableChange(i, 'price_buy', e.target.value === '' ? 0 : Number(e.target.value))} placeholder="Rp" className="w-full p-2 text-xs border border-slate-300 rounded" /></td>
                                                    <td className="p-2"><input type="number" value={v.price_sell || ''} onChange={(e) => handleVariantTableChange(i, 'price_sell', e.target.value === '' ? 0 : Number(e.target.value))} placeholder="Rp" className="w-full p-2 text-xs border border-slate-300 rounded" /></td>
                                                    <td className="p-2"><input type="number" value={v.weight_gram || ''} onChange={(e) => handleVariantTableChange(i, 'weight_gram', e.target.value === '' ? 0 : Number(e.target.value))} placeholder="gr" className="w-full p-2 text-xs border border-slate-300 rounded" /></td>
                                                    <td className="p-2"><input type="number" value={v.min_stock || ''} onChange={(e) => handleVariantTableChange(i, 'min_stock', e.target.value === '' ? 0 : Number(e.target.value))} placeholder="0" className="w-full p-2 text-xs border border-slate-300 rounded" /></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </ModalFormLayout>

            {/* Notifications and Sub-Modals below */}
            {nestedNotification && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 min-w-[300px] shadow-lg rounded-xl">
                    <Alert variant={nestedNotification.type} className="flex justify-between items-center shadow-lg">
                        <span>{nestedNotification.message}</span>
                        <button type="button" onClick={() => setNestedNotification(null)} className="ml-4 p-1 rounded-full hover:bg-black/5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg></button>
                    </Alert>
                </div>
            )}

            <Modal isOpen={isAddSupplierModalOpen} onClose={() => !isSubmittingSupplier && setIsAddSupplierModalOpen(false)} title="Tambah Supplier Baru" icon={<UserPlus className="h-5 w-5" />}>
                <div className="relative">
                    <SupplierForm onSubmit={handleCreateSupplier} onCancel={() => setIsAddSupplierModalOpen(false)} isSubmitting={isSubmittingSupplier} />
                </div>
            </Modal>
        </>
    );
};
