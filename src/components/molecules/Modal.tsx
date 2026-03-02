import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, description, icon, children }) => {
  return (
    <div 
        className={`fixed inset-0 z-60 flex items-center justify-center transition-all duration-300 ${
            isOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
        }`}
    >
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0'
                }`}
            ></div>

            {/* Modal Box */}
            <div 
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 relative z-10 overflow-hidden transition-all duration-300 transform flex flex-col max-h-[90vh] ${
                    isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                }`}
            >
                {/* Header */}
                {title && (
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
                      <div className="flex items-center gap-3">
                          {icon && <div className="text-gray-900 flex items-center">{icon}</div>}
                          <div>
                              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                              {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
                          </div>
                      </div>
                      <button 
                          type="button"
                          onClick={onClose}
                          className="text-gray-900 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors focus:outline-none"
                      >
                          <X className="h-5 w-5" strokeWidth={2.5} />
                      </button>
                  </div>
                )}

                {/* Body / Children */}
                <div className="overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};
