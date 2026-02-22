import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, description, children }) => {
    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
                isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Box */}
            <div 
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative z-10 overflow-hidden transition-all duration-300 transform ${
                    isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                }`}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
                        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors focus:outline-none"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body / Children */}
                <div className="px-6 py-5">
                    {children}
                </div>
            </div>
        </div>
    );
};
