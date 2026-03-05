import React, { useState } from 'react';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Pagination } from '@/components/molecules/Pagination';

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string; // e.g. for width control or alignment
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  onRowSelectionChange?: (selectedRows: T[]) => void;
  pagination?: PaginationState;
  actions?: (row: T) => React.ReactNode;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowSelectionChange,
  pagination,
  actions,
  isLoading,
}: DataTableProps<T>) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());

  const toggleAll = (checked: boolean) => {
    let newSelectedKeys = new Set<string | number>();
    if (checked) {
      newSelectedKeys = new Set(data.map(keyExtractor));
    }
    setSelectedKeys(newSelectedKeys);
    if (onRowSelectionChange) {
      onRowSelectionChange(checked ? data : []);
    }
  };

  const toggleRow = (key: string | number, checked: boolean) => {
    const newSelected = new Set(selectedKeys);
    if (checked) {
      newSelected.add(key);
    } else {
      newSelected.delete(key);
    }
    setSelectedKeys(newSelected);
    if (onRowSelectionChange) {
      const selectedData = data.filter((row) => newSelected.has(keyExtractor(row)));
      onRowSelectionChange(selectedData);
    }
  };

  const allSelected = data.length > 0 && selectedKeys.size === data.length;
  const someSelected = selectedKeys.size > 0 && selectedKeys.size < data.length;

  return (
    <div className="w-full bg-white dark:bg-slate-800 transition-colors rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 lg:overflow-visible overflow-x-auto flex flex-col">
      <div className="lg:overflow-x-visible overflow-x-auto flex-1 min-w-[800px]">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#e2e8f0]/60 dark:bg-slate-800/50 text-gray-700 dark:text-slate-200 font-semibold border-b border-gray-200 dark:border-slate-700 transition-colors">
            <tr>
              <th scope="col" className="p-4 w-4">
                <Checkbox
                  checked={allSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = someSelected;
                    }
                  }}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              {columns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`px-4 py-3 whitespace-nowrap ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th scope="col" className="px-4 py-3 whitespace-nowrap text-center">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/80">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr
                  key={`skeleton-row-${rowIndex}`}
                  className="animate-pulse border-b border-gray-100 dark:border-slate-700/80"
                >
                  <td className="p-4 w-4">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-4"></div>
                  </td>
                  {columns.map((col, i) => (
                    <td key={`skeleton-col-${i}`} className={`px-4 py-4 ${col.className || ''}`}>
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-8 mx-auto"></div>
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 2 : 1)}
                  className="px-4 py-8 text-center text-gray-500 dark:text-slate-400"
                >
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const key = keyExtractor(row);
                const isSelected = selectedKeys.has(key);
                return (
                  <tr
                    key={key}
                    className={`hover:bg-blue-50/30 dark:hover:bg-slate-750 transition-colors ${isSelected ? 'bg-blue-50/50 dark:bg-slate-700/50' : ''}`}
                  >
                    <td className="p-4 w-4">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => toggleRow(key, e.target.checked)}
                      />
                    </td>
                    {columns.map((col, i) => (
                      <td key={i} className={`px-4 py-4 ${col.className || ''}`}>
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                            ? String(row[col.accessorKey])
                            : null}
                      </td>
                    ))}
                    {actions && <td className="px-4 py-4 text-center">{actions(row)}</td>}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}
