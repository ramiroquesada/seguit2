import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: Extract<keyof T, string> | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  
  // Sorting
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;

  // Pagination
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  
  // Action click
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  sortKey,
  sortOrder,
  onSort,
  page,
  totalPages,
  onPageChange,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
              {columns.map((col) => (
                <th 
                  key={col.key as string}
                  style={{ 
                    padding: '16px 24px', 
                    fontWeight: 600, 
                    fontSize: '14px', 
                    color: 'var(--color-text-muted)',
                    cursor: col.sortable && onSort ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                  onClick={() => col.sortable && onSort && onSort(col.key as string)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span style={{ display: 'flex', color: 'var(--color-primary)' }}>
                        {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '48px', textAlign: 'center' }}>
                  <div className="spinner" style={{ margin: '0 auto' }}></div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No se encontraron resultados.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr 
                  key={keyExtractor(item)} 
                  onClick={() => onRowClick && onRowClick(item)}
                  style={{ 
                    borderBottom: '1px solid var(--color-border)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => { if (onRowClick) e.currentTarget.style.backgroundColor = 'var(--color-background)'; }}
                  onMouseLeave={(e) => { if (onRowClick) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {columns.map((col) => (
                    <td key={col.key as string} style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--color-text)' }}>
                      {col.render ? col.render(item) : String((item as any)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {page && totalPages && totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '16px 24px',
          borderTop: '1px solid var(--color-border)' 
        }}>
          <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Página {page} de {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-secondary" 
              disabled={page <= 1}
              onClick={() => onPageChange && onPageChange(page - 1)}
            >
              Anterior
            </button>
            <button 
              className="btn btn-secondary" 
              disabled={page >= totalPages}
              onClick={() => onPageChange && onPageChange(page + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
