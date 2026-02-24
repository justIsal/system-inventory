import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, currentPage + 1);

    if (currentPage <= 2) {
      end = Math.min(totalPages, 3);
    }
    if (currentPage >= totalPages - 1) {
      start = Math.max(1, totalPages - 2);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-end px-4 py-3 gap-6 text-sm text-gray-500 bg-gray-50/50 rounded-b-lg border-t border-gray-200">
      <div className="flex items-center gap-2">
        <span>Show</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-md border border-gray-300 py-1 pl-2 pr-6 text-sm outline-none focus:border-blue-500 bg-white"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-blue-500 hover:text-blue-700 hover:shadow-sm"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-blue-500 hover:text-blue-700 hover:shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1 mx-2">
           {pages[0] > 1 && (
             <>
               <span className="px-1">1</span>
               <span className="px-1 text-gray-400">...</span>
             </>
           )}
           {pages.map((page) => (
             <button
               key={page}
               onClick={() => onPageChange(page)}
               className={`min-w-[28px] h-7 rounded-md flex items-center justify-center text-sm font-medium transition-all ${
                 currentPage === page
                   ? 'border border-blue-500 text-blue-600 bg-blue-50'
                   : 'text-blue-500 hover:bg-white hover:shadow-sm hover:text-blue-700'
               }`}
             >
               {page}
             </button>
           ))}
           {pages[pages.length - 1] < totalPages && (
             <>
               <span className="px-1 text-gray-400">...</span>
               <span className="px-1">{totalPages}</span>
             </>
           )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-blue-500 hover:text-blue-700 hover:shadow-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-blue-500 hover:text-blue-700 hover:shadow-sm"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span>Jump To</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          className="w-12 rounded-md border border-gray-300 py-1 text-center text-sm outline-none focus:border-blue-500 bg-white shadow-sm"
          onKeyDown={(e) => {
             if (e.key === 'Enter') {
               const val = Number(e.currentTarget.value);
               if (val >= 1 && val <= totalPages) {
                 onPageChange(val);
               }
             }
          }}
        />
      </div>
    </div>
  );
};
