import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { CatalogToolbar, type SortConfig } from '@/components/organisms/CatalogToolbar';
import { DataTable, type ColumnDef } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { productService } from '@/services/api/productService';
import type { Product } from '@/types/product.types';
import { formatRupiah } from '@/utils/format';
import { MoreVertical, FolderPlus } from 'lucide-react';
import { Modal } from '@/components/molecules/Modal';
import { Alert } from '@/components/molecules/Alert';
import { ProductForm } from '@/components/organisms/ProductForm';
import { AlertCircle } from 'lucide-react';

export const Route = createFileRoute('/admin/_layout/katalog-produk/')({
  component: KatalogProdukPage,
});

function KatalogProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Pagination, Search & Sort State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'product_id', order: 'desc' });
  const [filterConfig, setFilterConfig] = useState<{ category?: string; inStock?: boolean }>({});

  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, searchQuery, sortConfig.key, sortConfig.order, filterConfig.category, filterConfig.inStock]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productService.getProducts(
        currentPage, 
        pageSize, 
        searchQuery,
        sortConfig.key,
        sortConfig.order
        // Note: Filters could be passed to backend here when supported natively
      );
      
      // Temporary client-side filtering while evaluating backend models
      let filteredData = response.data;
      if (filterConfig.category) {
        filteredData = filteredData.filter(p => (p.category || 'Elektronik') === filterConfig.category);
      }
      if (filterConfig.inStock) {
        filteredData = filteredData.filter(p => (p.stock ?? 0) > 0);
      }

      setProducts(filteredData);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    setIsSubmitting(true);
    setNotification(null);
    try {
      const idsToDelete = selectedProducts.map(p => p.product_id);
      await productService.deleteProducts(idsToDelete);
      
      setNotification({ type: 'success', message: `${idsToDelete.length} produk berhasil dihapus.` });
      setSelectedProducts([]); // Clear selection
      setIsDeleteModalOpen(false);
      
      // If we deleted all items on the current page, we might want to go back a page
      if (products.length === idsToDelete.length && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
      } else {
          fetchProducts();
      }
      
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      console.error('Failed to delete products:', error);
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Terjadi kesalahan saat menghapus produk.' 
      });
      setIsDeleteModalOpen(false); // Close modal even on error to show global toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProduct = async (data: { sku: string; name: string; unit: string | null; min_stock: number; price_buy: number; }) => {
    setIsSubmitting(true);
    setNotification(null);
    try {
      // Backend schema nullable transform
      const payload = {
        ...data,
        unit: data.unit ?? null
      };
      await productService.createProduct(payload as any); // using any here since the Omit<Product> forces unit to string | null but the form payload uses string | undefined. We safely cast it.
      setIsAddModalOpen(false);
      setNotification({ type: 'success', message: 'Produk berhasil ditambahkan ke katalog.' });
      setCurrentPage(1);
      fetchProducts();
      
      // Auto dismiss success notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      console.error('Failed to create product:', error);
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Gagal menambahkan produk. Periksa kembali input Anda.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      header: 'SKU',
      accessorKey: 'sku',
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Nama Produk',
      accessorKey: 'name',
    },
    {
      header: 'Kategori',
      cell: (row) => row.category || 'Elektronik', // Fallback since backend doesn't have it yet
    },
    {
      header: 'Stok Saat Ini',
      cell: (row) => {
        const stockVal = row.stock ?? 0;
        return (
          <Badge variant={stockVal > 0 ? 'success' : 'danger'}>
            {stockVal}
          </Badge>
        );
      },
      className: 'text-center'
    },
    {
      header: 'Unit',
      cell: (row) => row.unit || '-',
    },
    {
      header: 'Harga Beli',
      cell: (row) => formatRupiah(row.price_buy || 0),
    },
  ];

  return (
    <div className="space-y-6 mx-auto pb-10">
      {/* Breadcrumb Area */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <span>Dashboard</span>
        <span className="text-gray-300">/</span>
        <span className="text-teal-500 font-medium">Katalog Produk</span>
      </div>

      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 min-w-[300px] shadow-lg rounded-xl">
          <Alert variant={notification.type} className="flex justify-between items-center shadow-lg">
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 p-1 rounded-full hover:bg-black/5 transition-colors focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </Alert>
        </div>
      )}

      <CatalogToolbar
        selectedCount={selectedProducts.length}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1); // Reset to first page on search
        }}
        onDeleteSelected={() => setIsDeleteModalOpen(true)}
        onAddClick={() => setIsAddModalOpen(true)}
        currentSort={sortConfig}
        onSortChange={(sort) => {
          setSortConfig(sort);
          setCurrentPage(1);
        }}
        currentFilters={filterConfig}
        onFilterChange={(filters) => {
          setFilterConfig(filters);
          setCurrentPage(1);
        }}
      />

      <DataTable
        columns={columns}
        data={products}
        keyExtractor={(row) => row.product_id}
        isLoading={isLoading}
        onRowSelectionChange={setSelectedProducts}
        pagination={{
           currentPage,
           totalPages,
           pageSize,
           onPageChange: setCurrentPage,
           onPageSizeChange: (size) => {
             setPageSize(size);
             setCurrentPage(1);
           }
        }}
        actions={() => (
          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-600">
             <MoreVertical className="h-4 w-4" />
          </button>
        )}
      />

      {/* Add Product Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => !isSubmitting && setIsAddModalOpen(false)}
        title="Tambah Produk Baru"
        icon={<FolderPlus className="h-5 w-5" />}
      >
        <ProductForm 
          onSubmit={handleCreateProduct} 
          onCancel={() => setIsAddModalOpen(false)} 
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        icon={<AlertCircle className="h-5 w-5 text-red-500" />}
      >
        <div className="px-6 py-5">
            <p className="text-gray-700 mb-6">
                Apakah Anda yakin ingin menghapus <strong>{selectedProducts.length}</strong> produk yang dipilih? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    Batal
                </button>
                <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center min-w-[100px]"
                >
                    {isSubmitting ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        "Hapus Produk"
                    )}
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
}
