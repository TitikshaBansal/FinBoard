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
    if (!widget.data) return [];

    // If we have selected fields, use them
    if (widget.selectedFields.length > 0) {
      return widget.selectedFields.map((field) => {
        const value = extractFieldValue(widget.data, field.path);
        return {
          ...field,
          value,
        };
      });
    }

    // Otherwise, try to extract fields from the data structure
    const extractedFields: any[] = [];
    const data = widget.data;

    // Handle Coinbase API format: { data: { currency: "BTC", rates: {...} } }
    if (data.data && typeof data.data === 'object') {
      const dataObj = data.data;
      
      if (dataObj.currency) {
        extractedFields.push({
          path: 'data.currency',
          displayName: 'currency',
          alias: 'currency',
          value: dataObj.currency,
        });
      }

      if (dataObj.rates && typeof dataObj.rates === 'object') {
        // Get all rates
        Object.entries(dataObj.rates).forEach(([key, value]) => {
          extractedFields.push({
            path: `data.rates.${key}`,
            displayName: key,
            alias: key,
            value: value,
          });
        });
      }
    } else {
      // Handle flat objects
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value !== 'object' || value === null) {
          extractedFields.push({
            path: key,
            displayName: key,
            alias: key,
            value: value,
          });
        }
      });
    }

    return extractedFields;
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
        <div className="flex flex-col items-center justify-center h-full p-4">
          <p className="text-gray-500 text-sm mb-2">No data available</p>
          <p className="text-gray-600 text-xs text-center">
            Please select fields to display or check your API connection
          </p>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget widget={widget}>
      <div className="space-y-4">
        {fieldValues.map((field, index) => {
          const displayName = field.displayName || field.alias || field.path?.split('.').pop() || 'Value';
          const formattedValue = formatValue(field.value, field);
          
          return (
            <div
              key={field.path || index}
              className="flex items-center justify-between py-3 border-b border-dark-700 last:border-0"
            >
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                {displayName}
              </span>
              <span className="text-lg font-semibold text-white text-right break-words max-w-[60%]">
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </BaseWidget>
  );
};

