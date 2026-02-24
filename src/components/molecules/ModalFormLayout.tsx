import React from 'react';

interface ModalFormLayoutProps {
  description?: string;
  submitText?: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  children: React.ReactNode;
}

export const ModalFormLayout: React.FC<ModalFormLayoutProps> = ({
  description,
  submitText = 'Simpan',
  onSubmit,
  onCancel,
  isSubmitting = false,
  children,
}) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full">
      {/* Scrollable Content Area */}
      <div className="px-6 py-5 flex-1">
        {description && <p className="text-sm text-gray-500 mb-6">{description}</p>}
        
        {/* Form Fields */}
        <div className="space-y-4">
            {children}
        </div>
      </div>

      {/* Sticky Footer for Actions */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3 sticky bottom-0 rounded-b-2xl">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-semibold text-red-500 bg-white border border-red-500 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors shadow-sm"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-500 border border-transparent rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors shadow-sm flex items-center justify-center min-w-[120px]"
        >
          {isSubmitting ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
             submitText
          )}
        </button>
      </div>
    </form>
  );
};
