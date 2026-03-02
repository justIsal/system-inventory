import { useState } from 'react';
import { Filter, ArrowDownUp, Search, Plus, Trash2, Check } from 'lucide-react';

export type SortConfig = {
  key: string;
  order: 'asc' | 'desc';
};

interface CatalogToolbarProps {
  onSearchChange: (val: string) => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  onAddClick: () => void;
  onSortChange: (sort: SortConfig) => void;
  currentSort?: SortConfig;
  onFilterChange: (filters: { category?: string; inStock?: boolean }) => void;
  currentFilters?: { category?: string; inStock?: boolean };
  categories?: { id: number; name: string }[];
  addButtonLabel?: string;
}

export const CatalogToolbar = ({
  onSearchChange,
  selectedCount,
  onDeleteSelected,
  onAddClick,
  onSortChange,
  currentSort,
  onFilterChange,
  currentFilters,
  categories = [],
  addButtonLabel = 'Tambah Produk',
}: CatalogToolbarProps) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const sortOptions = [
    { label: 'Terbaru Ditambahkan', key: 'product_id', order: 'desc' as const },
    { label: 'Nama (A-Z)', key: 'name', order: 'asc' as const },
    { label: 'Nama (Z-A)', key: 'name', order: 'desc' as const },
    { label: 'Harga Terendah', key: 'price_buy', order: 'asc' as const },
    { label: 'Harga Tertinggi', key: 'price_buy', order: 'desc' as const },
    { label: 'Stok Terendah', key: 'min_stock', order: 'asc' as const },
    { label: 'Stok Tertinggi', key: 'min_stock', order: 'desc' as const },
  ];

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        {selectedCount > 0 && (
          <div className="flex items-center gap-3 mr-4">
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200">
              {selectedCount} Select{selectedCount > 1 ? 'ed' : ''}
            </span>
            <button
              type="button"
              onClick={onDeleteSelected}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors shadow-sm bg-white"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 relative">
        <button 
          type="button"
          onClick={() => {
            setIsFilterOpen(!isFilterOpen);
            setIsSortOpen(false);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Filter className="h-4 w-4 text-gray-500" /> Filter
        </button>

        {isFilterOpen && (
          <div className="absolute top-12 left-0 w-64 bg-white border border-gray-200 rounded-lg drop-shadow-xl z-20 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 border-b pb-2">Filter Produk</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Kategori</label>
              <select 
                className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={currentFilters?.category || ''}
                onChange={(e) => onFilterChange({ ...currentFilters, category: e.target.value || undefined })}
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                   <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Status Stok</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-blue-600"
                  checked={currentFilters?.inStock || false}
                  onChange={(e) => onFilterChange({ ...currentFilters, inStock: e.target.checked })}
                />
                <span className="text-sm text-gray-700">Hanya tampilkan stok tersedia</span>
              </label>
            </div>
            
            <div className="mt-4 pt-3 border-t flex justify-end">
               <button 
                 type="button"
                 onClick={() => onFilterChange({ category: undefined, inStock: false })}
                 className="text-xs text-blue-600 hover:text-blue-800 font-medium"
               >
                 Reset Filter
               </button>
            </div>
          </div>
        )}

        <button 
          type="button"
          onClick={() => {
            setIsSortOpen(!isSortOpen);
            setIsFilterOpen(false);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowDownUp className="h-4 w-4 text-gray-500" /> Sort By
        </button>

        {isSortOpen && (
          <div className="absolute top-12 left-[100px] w-56 bg-white border border-gray-200 rounded-lg drop-shadow-xl z-10 py-2">
            {sortOptions.map((opt) => {
                const isActive = currentSort?.key === opt.key && currentSort?.order === opt.order;
                return (
                    <button
                        type="button"
                        key={`${opt.key}-${opt.order}`}
                        onClick={() => {
                            onSortChange({ key: opt.key, order: opt.order });
                            setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${isActive ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-gray-700'}`}
                    >
                        {opt.label}
                        {isActive && <Check className="h-4 w-4" />}
                    </button>
                )
            })}
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors shadow-sm"
            placeholder="Search"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white font-medium rounded-lg hover:bg-teal-800 transition-colors shadow-sm ml-2"
        >
          <Plus className="h-4 w-4" /> {addButtonLabel}
        </button>
      </div>
    </div>
  );
};
