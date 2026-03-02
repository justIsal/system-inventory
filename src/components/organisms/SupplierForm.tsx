import React from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
import { Input } from '@/components/atoms/Input';
import { ModalFormLayout } from '@/components/molecules/ModalFormLayout';

const supplierSchema = z.object({
  name: z.string().min(1, 'Nama supplier wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().optional(),
  contact_person: z.string().optional(),
  address: z.string().optional(),
  npwp: z.string().optional(),
  nok_rek: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  onSubmit: (data: SupplierFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const form: any = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '' as string | undefined,
      contact_person: '' as string | undefined,
      address: '' as string | undefined,
      npwp: '' as string | undefined,
      nok_rek: '' as string | undefined,
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: supplierSchema as any,
    },
    onSubmit: async ({ value }: any) => {
      await onSubmit(value);
    }
  } as any);

  return (
    <ModalFormLayout
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitText="Simpan Supplier"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Informasi Utama</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <form.Field
                name="name"
                validators={{ onChange: supplierSchema.shape.name }}
                children={(field: any) => (
                  <div>
                    <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Supplier <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Contoh: PT Sumber Rejeki"
                      error={field.state.meta.errors?.length ? String((field.state.meta.errors[0] as any).message || field.state.meta.errors[0]) : undefined}
                    />
                  </div>
                )}
              />
            </div>
            
            <form.Field
              name="email"
              validators={{ onChange: supplierSchema.shape.email }}
              children={(field: any) => (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="kontak@perusahaan.com"
                    error={field.state.meta.errors?.length ? String((field.state.meta.errors[0] as any).message || field.state.meta.errors[0]) : undefined}
                  />
                </div>
              )}
            />

            <form.Field
              name="phone"
              validators={{ onChange: supplierSchema.shape.phone }}
              children={(field: any) => (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="+62 812..."
                    error={field.state.meta.errors?.length ? String((field.state.meta.errors[0] as any).message || field.state.meta.errors[0]) : undefined}
                  />
                </div>
              )}
            />

            <div className="md:col-span-2">
              <form.Field
                name="contact_person"
                validators={{ onChange: supplierSchema.shape.contact_person }}
                children={(field: any) => (
                  <div>
                    <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person / Penanggung Jawab
                    </label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Nama orang yang bisa dihubungi"
                      error={field.state.meta.errors?.length ? String((field.state.meta.errors[0] as any).message || field.state.meta.errors[0]) : undefined}
                    />
                  </div>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <form.Field
                name="address"
                validators={{ onChange: supplierSchema.shape.address }}
                children={(field: any) => (
                  <div>
                    <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat
                    </label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Alamat lengkap perusahaan"
                      error={field.state.meta.errors?.length ? String((field.state.meta.errors[0] as any).message || field.state.meta.errors[0]) : undefined}
                    />
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        <div>
           <h3 className="text-sm font-bold text-gray-900 mb-3">Informasi Finansial & Pajak</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="npwp"
              validators={{ onChange: supplierSchema.shape.npwp }}
              children={(field: any) => (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    NPWP
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Nomor Pokok Wajib Pajak"
                    error={field.state.meta.errors?.length ? String((field.state.meta.errors[0] as any).message || field.state.meta.errors[0]) : undefined}
                  />
                </div>
              )}
            />

            <form.Field
              name="nok_rek"
              validators={{ onChange: supplierSchema.shape.nok_rek }}
              children={(field: any) => (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Rekening
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Nomor rekening bank"
                    error={field.state.meta.errors?.length ? String((field.state.meta.errors[0] as any).message || field.state.meta.errors[0]) : undefined}
                  />
                </div>
              )}
            />
           </div>
        </div>
      </div>
    </ModalFormLayout>
  );
};
