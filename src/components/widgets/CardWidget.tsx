'use client';

import React, { useMemo } from 'react';
import { WidgetConfig } from '@/types/widget';
import { BaseWidget } from './BaseWidget';
import { extractFieldValue } from '@/lib/api/adapters';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/formatting';

interface CardWidgetProps {
  widget: WidgetConfig;
}

export const CardWidget: React.FC<CardWidgetProps> = ({ widget }) => {
  const fieldValues = useMemo(() => {
    if (!widget.data || !widget.selectedFields.length) return [];

    return widget.selectedFields.map((field) => {
      const value = extractFieldValue(widget.data, field.path);
      return {
        ...field,
        value,
      };
    });
  }, [widget.data, widget.selectedFields]);

  const formatValue = (value: any, field: any): string => {
    if (value === null || value === undefined) return 'N/A';
    
    if (typeof value === 'number') {
      // Try to detect if it's a currency or percentage based on field name
      const fieldName = field.displayName || field.path.toLowerCase();
      if (fieldName.includes('price') || fieldName.includes('amount') || fieldName.includes('value')) {
        return formatCurrency(value);
      }
      if (fieldName.includes('percent') || fieldName.includes('change') || fieldName.includes('rate')) {
        return formatPercentage(value);
      }
      return formatNumber(value);
    }

    if (typeof value === 'string') {
      // Try to parse as number
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const fieldName = field.displayName || field.path.toLowerCase();
        if (fieldName.includes('price') || fieldName.includes('amount') || fieldName.includes('value')) {
          return formatCurrency(numValue);
        }
        if (fieldName.includes('percent') || fieldName.includes('change') || fieldName.includes('rate')) {
          return formatPercentage(numValue);
        }
        return formatNumber(numValue);
      }
      return value;
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  if (fieldValues.length === 0) {
    return (
      <BaseWidget widget={widget}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">No fields selected</p>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget widget={widget}>
      <div className="space-y-4">
        {fieldValues.map((field, index) => (
          <div
            key={field.path}
            className="bg-dark-700 rounded-lg p-4 border border-dark-600"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-400">
                {field.displayName || field.alias || field.path.split('.').pop()}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatValue(field.value, field)}
            </div>
          </div>
        ))}
      </div>
    </BaseWidget>
  );
};

