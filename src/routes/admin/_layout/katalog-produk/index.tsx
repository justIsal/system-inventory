import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { CatalogToolbar, type SortConfig } from '@/components/organisms/CatalogToolbar';
import { DataTable, type ColumnDef } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { productService } from '@/services/api/productService';
import { categoryService, type Category } from '@/services/api/categoryService';
import type { Product } from '@/types/product.types';
import { formatRupiah } from '@/utils/format';
import { FolderPlus, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/molecules/Modal';
import { ActionDropdown } from '@/components/molecules/ActionDropdown';
import { Alert } from '@/components/molecules/Alert';
import { ProductForm } from '@/components/organisms/ProductForm';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs';

export const Route = createFileRoute('/admin/_layout/katalog-produk/')({
  component: KatalogProdukPage,
});

function KatalogProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Pagination, Search & Sort State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'product_id', order: 'desc' });
  const [filterConfig, setFilterConfig] = useState<{ category?: string; inStock?: boolean }>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, searchQuery, sortConfig.key, sortConfig.order, filterConfig.category, filterConfig.inStock]);

  const fetchCategories = async () => {
    try {
        const data = await categoryService.getAllCategories();
        setCategories(data);
    } catch (err) {
        console.error('Failed to fetch categories:', err);
    }
  };

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
        filteredData = filteredData.filter(p => (p.category?.name || 'Elektronik') === filterConfig.category);
      }
      if (filterConfig.inStock) {
        filteredData = filteredData.filter(p => {
            const totalStock = p.variants?.reduce((acc, v) => acc + (v.stocks?.reduce((sAcc, s) => sAcc + s.quantity, 0) || 0), 0) || 0;
            return totalStock > 0;
        });
      }

      setProducts(filteredData);
      setTotalPages(response.totalPages ?? 1);
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

  const handleCreateProduct = async (data: any) => {
    setIsSubmitting(true);
    setNotification(null);
    try {
      await productService.createProduct(data);
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

  const handleDeleteProduct = (product: Product) => {
    setSelectedProducts([product]);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateProduct = async (data: any) => {
    if (!editingProduct) return;
    setIsSubmitting(true);
    setNotification(null);
    try {
      console.log(data);
      await productService.updateProduct(editingProduct.product_id.toString(), data);

      setIsEditModalOpen(false);
      setEditingProduct(null);
      setNotification({ type: 'success', message: 'Produk berhasil diperbarui.' });
      fetchProducts();
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      console.error('Failed to update product:', error);
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Gagal memperbarui produk.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      header: 'SKU Induk/Varian',
      accessorKey: 'product_id',
      cell: (row) => row.has_variants ? `Multi (${row.variants?.length} Varian)` : (row.variants?.[0]?.sku || '-'),
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Nama Produk',
      accessorKey: 'name',
    },
    {
      header: 'Kategori',
      cell: (row) => row.category?.name || '-', 
    },
    {
      header: 'Stok Saat Ini',
      cell: (row) => {
        // Calculate total stock from all variants
        const stockVal = row.variants?.reduce((acc, v) => {
             const variantStock = v.stocks?.reduce((sAcc, s) => sAcc + s.quantity, 0) || 0;
             return acc + variantStock;
        }, 0) || 0;
        
        return (
          <Badge variant={stockVal > 0 ? 'success' : 'danger'}>
            {stockVal}
          </Badge>
        );
      },
      className: 'text-center'
    },
    {
      header: 'Unit Dasar',
      cell: (row) => row.variants?.[0]?.unit || '-',
    },
    {
      header: 'Harga Beli Dasar',
      cell: (row) => formatRupiah(row.variants?.[0]?.price_buy || 0),
    },
    {
      header: 'Harga Jual Dasar',
      cell: (row) => formatRupiah(row.variants?.[0]?.price_sell || 0),
    },
    {
      header: 'Aksi',
      cell: (row) => (
          <ActionDropdown 
              items={[
                  { label: 'View Detail', icon: <Eye size={16} />, onClick: () => window.location.href = `/admin/katalog-produk/${row.product_id}` },
                  { label: 'Edit Produk', icon: <Edit size={16} />, onClick: () => { setEditingProduct(row); setIsEditModalOpen(true); } },
                  { label: 'Hapus Produk', icon: <Trash2 size={16} />, variant: 'danger', onClick: () => handleDeleteProduct(row) }
              ]}
          />
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6 mx-auto pb-10">
      {/* Breadcrumb Area */}
      <Breadcrumbs 
        items={[
            { label: 'Dashboard', path: '/admin' },
            { label: 'Katalog Produk' }
        ]} 
        className="mb-8"
      />

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
        categories={categories}
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
      />

      {/* Add Product Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => !isSubmitting && setIsAddModalOpen(false)}
        title="Tambah Produk Baru"
        icon={<FolderPlus className="h-5 w-5" />}
      >
        {isAddModalOpen && (
          <ProductForm 
            key="add-product-form"
            onSubmit={handleCreateProduct} 
            onCancel={() => setIsAddModalOpen(false)} 
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* Edit Product Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => { if (!isSubmitting) { setIsEditModalOpen(false); setEditingProduct(null); } }}
        title="Edit Produk"
        icon={<Edit className="h-5 w-5" />}
      >
        {editingProduct && (
          <ProductForm 
            initialData={editingProduct}
            onSubmit={handleUpdateProduct} 
            onCancel={() => { setIsEditModalOpen(false); setEditingProduct(null); }} 
            isSubmitting={isSubmitting}
          />
        )}
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
