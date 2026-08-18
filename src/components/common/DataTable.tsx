import React from 'react';
import { ChevronLeft, ChevronRight, Inbox, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { LoadingSkeleton } from './LoadingSkeleton';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyText?: string;
  page?: number;
  totalPages?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
  actions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  // Server-side Sorting & Filters
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyText = 'No records found',
  page = 1,
  totalPages = 1,
  totalRecords,
  onPageChange,
  actions,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort
}: DataTableProps<T>) {
  // 44. UI STATES: Initial Loading / Skeleton Loader State
  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300 border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-950/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 select-none">
            <tr>
              {columns.map((col) => {
                const isSorted = sortColumn === col.key;

                return (
                  <th 
                    key={col.key} 
                    onClick={() => col.sortable !== false && onSort && onSort(col.key)}
                    className={`px-4 py-3.5 ${col.className || ''} ${col.sortable !== false && onSort ? 'cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable !== false && onSort && (
                        isSorted ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                        )
                      )}
                    </div>
                  </th>
                );
              })}
              {actions && <th className="px-4 py-3.5 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {/* 44. UI STATES: Empty Result State */}
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-10 h-10 text-slate-400 dark:text-slate-600 stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{emptyText}</p>
                  </div>
                </td>
              </tr>
            ) : (
              /* 44. UI STATES: Success State Data Rendering */
              data.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3.5 whitespace-nowrap ${col.className || ''}`}>
                      {col.render ? col.render(row, idx) : (row as any)[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Server-Side Pagination Bar */}
      {onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">Page {page}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span>
            {totalRecords !== undefined && (
              <span className="ml-2">({totalRecords} total entries)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
