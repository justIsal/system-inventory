import React, { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Input } from '@/components/atoms/Input';
import { ModalFormLayout } from '@/components/molecules/ModalFormLayout';
import { Modal } from '@/components/molecules/Modal';
import { SupplierForm } from './SupplierForm';
import { supplierService, type Supplier } from '@/services/api/supplierService';
import { Plus, UserPlus } from 'lucide-react';
import { Alert } from '@/components/molecules/Alert';

// Define schema matching backend CreateProductRequestSchema
const productSchema = z.object({
  sku: z.string().min(1, 'SKU wajib diisi'),
  name: z.string().min(1, 'Nama produk wajib diisi'),
  unit: z.string().optional(),
  min_stock: z.number().int().nonnegative('Stok minimal tidak boleh negatif').optional(),
  price_buy: z.number().nonnegative('Harga beli tidak boleh negatif'),
  supplier_id: z.number().int().positive('Supplier wajib dipilih'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const form = useForm({
    defaultValues: {
      sku: '',
      name: '',
      unit: '' as string | undefined, // Note: undefined matches Zod optional correctly
      min_stock: 0,
      price_buy: 0,
      supplier_id: 0, // Using 0 as initial empty state, will fail positive() validation if untouched
    } as ProductFormValues,
    validators: {
      onChange: productSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isFetchingSuppliers, setIsFetchingSuppliers] = useState(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isSubmittingSupplier, setIsSubmittingSupplier] = useState(false);
  const [nestedNotification, setNestedNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchSuppliers = async () => {
    setIsFetchingSuppliers(true);
    try {
      // Fetch maximum 100 for dropdown, or could trigger async search if we build an autocomplete
      const response = await supplierService.getSuppliers(1, 100);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setIsFetchingSuppliers(true); // Wait, no, false
    }
  };

  useEffect(() => {
    setIsFetchingSuppliers(true);
    supplierService.getSuppliers(1, 100)
      .then(res => setSuppliers(res.data))
      .catch(console.error)
      .finally(() => setIsFetchingSuppliers(false));
  }, []);

  const handleCreateSupplier = async (data: any) => {
    setIsSubmittingSupplier(true);
    setNestedNotification(null);
    try {
      const newSupplier = await supplierService.createSupplier(data);
      setNestedNotification({ type: 'success', message: 'Supplier berhasil ditambahkan.' });
      
      // Refresh list to include new supplier
      const res = await supplierService.getSuppliers(1, 100);
      setSuppliers(res.data);
      
      // Auto-select the newly created supplier
      form.setFieldValue('supplier_id', newSupplier.supplier_id);
      
      setTimeout(() => {
          setIsAddSupplierModalOpen(false);
          setNestedNotification(null);
      }, 1500); // short delay to show success before closing modal
    } catch (error: any) {
      setNestedNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Gagal menambahkan supplier' 
      });
    } finally {
      setIsSubmittingSupplier(false);
    }
  };

  return (
    <>
      <ModalFormLayout
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitText="Simpan Produk"
    >
      <div className="space-y-6">
        {/* Informasi Dasar */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Informasi Dasar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="name"
              validators={{ onChange: z.string().min(1, 'Nama produk wajib diisi') }}
              children={(field) => (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Produk
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Nama Produk"
                    error={field.state.meta.errors?.length ? String((field.state.meta.errors[0] as any).message || field.state.meta.errors[0]) : undefined}
                  />
                </div>
              )}
            />
            
            <form.Field
              name="sku"
              validators={{ onChange: z.string().min(1, 'SKU wajib diisi') }}
              children={(field) => (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id={field.name}
                      name={field.name}
                      className="flex-1"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="SKU"
                      error={field.state.meta.errors?.length ? String((field.state.meta.errors[0] as any).message || field.state.meta.errors[0]) : undefined}
                    />
                    <button type="button" className="px-3 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    </button>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Kategori */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Kategori</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors">
                <option value="">Kategori</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Pakaian">Pakaian</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventaris */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Inventaris</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="unit"
              validators={{ onChange: z.string().optional() }}
              children={(field) => (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Unit"
                    error={field.state.meta.errors?.length ? String((field.state.meta.errors[0] as any).message || field.state.meta.errors[0]) : undefined}
                  />
                </div>
              )}
            />

            <form.Field
              name="min_stock"
              validators={{ onChange: z.number().int().nonnegative('Stok minimal tidak boleh negatif').optional() }}
              children={(field) => (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Stok
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="0"
                    value={field.state.value === 0 ? '' : field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value ? parseInt(e.target.value) : 0)}
                    placeholder="0"
                    error={field.state.meta.errors?.length ? String((field.state.meta.errors[0] as any).message || field.state.meta.errors[0]) : undefined}
                  />
                </div>
              )}
            />
          </div>
        </div>

        {/* Finansial & Relasi */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Finansial & Relasi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="price_buy"
              validators={{ onChange: z.number().nonnegative('Harga beli tidak boleh negatif') }}
              children={(field) => (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    Harga Beli
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="0"
                    value={field.state.value === 0 ? '' : field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value ? parseFloat(e.target.value) : 0)}
                    placeholder="0"
                    error={field.state.meta.errors?.length ? String((field.state.meta.errors[0] as any).message || field.state.meta.errors[0]) : undefined}
                  />
                </div>
              )}
            />
            {/* Supplier Utama UI */}
            <form.Field
              name="supplier_id"
              validators={{ onChange: z.number().int().positive('Supplier wajib dipilih') }}
              children={(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Utama <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <select 
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none"
                            value={field.state.value || ''}
                            onChange={(e) => field.handleChange(Number(e.target.value))}
                            onBlur={field.handleBlur}
                        >
                            <option value="" disabled>Pilih Supplier</option>
                            {isFetchingSuppliers ? (
                                <option value="" disabled>Memuat...</option>
                            ) : (
                                suppliers.map(s => (
                                    <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
                                ))
                            )}
                        </select>
                        {/* Custom Select Chevron */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onClick={() => setIsAddSupplierModalOpen(true)}
                        className="px-3 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center whitespace-nowrap text-sm font-medium gap-1"
                    >
                      <Plus className="h-4 w-4" /> Tambah
                    </button>
                  </div>
                  {field.state.meta.errors?.length ? (
                    <p className="mt-1 text-sm text-red-500">{String((field.state.meta.errors[0] as any).message || field.state.meta.errors[0])}</p>
                  ) : null}
                </div>
              )}
            />
          </div>
        </div>
      </div>
      </ModalFormLayout>

      {/* Global Toast Notification for Supplier Form */}
      {nestedNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 min-w-[300px] shadow-lg rounded-xl">
          <Alert variant={nestedNotification.type} className="flex justify-between items-center shadow-lg">
            <span>{nestedNotification.message}</span>
            <button 
              type="button"
              onClick={() => setNestedNotification(null)}
              className="ml-4 p-1 rounded-full hover:bg-black/5 transition-colors focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </Alert>
        </div>
      )}

      {/* Nested Add Supplier Modal */}
      <Modal
        isOpen={isAddSupplierModalOpen}
        onClose={() => !isSubmittingSupplier && setIsAddSupplierModalOpen(false)}
        title="Tambah Supplier Baru"
        icon={<UserPlus className="h-5 w-5" />}
      >
        <div className="relative">
            <SupplierForm 
                onSubmit={handleCreateSupplier}
                onCancel={() => setIsAddSupplierModalOpen(false)}
                isSubmitting={isSubmittingSupplier}
            />
        </div>
      </Modal>
    </>
  );
};
