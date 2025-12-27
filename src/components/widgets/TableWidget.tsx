'use client';

import React, { useState, useMemo } from 'react';
import { WidgetConfig } from '@/types/widget';
import { BaseWidget } from './BaseWidget';
import { extractFieldValue } from '@/lib/api/adapters';
import { Input } from '@/components/common/Input';

interface TableWidgetProps {
  widget: WidgetConfig;
}

type SortConfig = {
  field: string;
  direction: 'asc' | 'desc';
};

export const TableWidget: React.FC<TableWidgetProps> = ({ widget }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tableData = useMemo(() => {
    if (!widget.data || !widget.selectedFields.length) return [];

    // Extract data - handle arrays
    let dataArray: any[] = [];
    
    // Check if the data itself is an array
    if (Array.isArray(widget.data)) {
      dataArray = widget.data;
    } else {
      // Try to find an array field
      const arrayField = widget.selectedFields.find((field) => {
        const value = extractFieldValue(widget.data, field.path);
        return Array.isArray(value);
      });

      if (arrayField) {
        const arrayValue = extractFieldValue(widget.data, arrayField.path);
        if (Array.isArray(arrayValue)) {
          dataArray = arrayValue;
        }
      } else {
        // Single object, wrap in array
        dataArray = [widget.data];
      }
    }

    // Map to table rows
    return dataArray.map((item, index) => {
      const row: Record<string, any> = { _index: index };
      widget.selectedFields.forEach((field) => {
        const value = extractFieldValue(item, field.path);
        row[field.path] = value;
        row[`_${field.path}_display`] = field.displayName || field.alias || field.path.split('.').pop();
      });
      return row;
    });
  }, [widget.data, widget.selectedFields]);

  const filteredData = useMemo(() => {
    let filtered = tableData;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(query)
        )
      );
    }

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.field];
        const bVal = b[sortConfig.field];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison =
          typeof aVal === 'number' && typeof bVal === 'number'
            ? aVal - bVal
            : String(aVal).localeCompare(String(bVal));

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [tableData, searchQuery, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleSort = (field: string) => {
    setSortConfig((prev) => {
      if (prev?.field === field) {
        return {
          field,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { field, direction: 'asc' };
    });
  };

  if (tableData.length === 0) {
    return (
      <BaseWidget widget={widget}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">No data available</p>
        </div>
      </BaseWidget>
    );
  }

  const columns = widget.selectedFields.map((field) => ({
    path: field.path,
    displayName: field.displayName || field.alias || field.path.split('.').pop() || field.path,
  }));

  return (
    <BaseWidget widget={widget}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search table..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-xs"
          />
          <p className="text-sm text-gray-400">
            {filteredData.length} of {tableData.length} items
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-dark-600">
                {columns.map((col) => (
                  <th
                    key={col.path}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort(col.path)}
                  >
                    <div className="flex items-center gap-2">
                      {col.displayName}
                      {sortConfig?.field === col.path && (
                        <span className="text-primary-500">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIndex) => (
                <tr
                  key={row._index}
                  className="border-b border-dark-700 hover:bg-dark-700 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.path} className="px-4 py-3 text-sm text-white">
                      {row[col.path] !== null && row[col.path] !== undefined
                        ? String(row[col.path])
                        : 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-dark-700 text-white rounded hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-dark-700 text-white rounded hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

