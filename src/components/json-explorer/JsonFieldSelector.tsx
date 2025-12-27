'use client';

import React, { useState, useMemo } from 'react';
import { JsonField, SelectedField } from '@/types/widget';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { searchFields, filterArrayFields } from '@/lib/api/adapters';

interface JsonFieldSelectorProps {
  fields: JsonField[];
  selectedFields: SelectedField[];
  onFieldsChange: (fields: SelectedField[]) => void;
  displayMode: 'card' | 'table' | 'chart';
  onDisplayModeChange?: (mode: 'card' | 'table' | 'chart') => void;
}

export const JsonFieldSelector: React.FC<JsonFieldSelectorProps> = ({
  fields,
  selectedFields,
  onFieldsChange,
  displayMode,
  onDisplayModeChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArraysOnly, setShowArraysOnly] = useState(false);
  const [fieldAliases, setFieldAliases] = useState<Record<string, string>>({});

  const availableFields = useMemo(() => {
    let filtered = fields;
    
    if (showArraysOnly && displayMode === 'table') {
      filtered = filterArrayFields(fields);
    }
    
    if (searchQuery) {
      filtered = searchFields(filtered, searchQuery);
    }
    
    return filtered.filter(
      (field) => !selectedFields.some((sf) => sf.path === field.path)
    );
  }, [fields, selectedFields, searchQuery, showArraysOnly, displayMode]);

  const handleAddField = (field: JsonField) => {
    const newSelected: SelectedField = {
      path: field.path,
      alias: fieldAliases[field.path] || field.path.split('.').pop(),
      displayName: fieldAliases[field.path] || field.path.split('.').pop(),
    };
    onFieldsChange([...selectedFields, newSelected]);
  };

  const handleRemoveField = (path: string) => {
    onFieldsChange(selectedFields.filter((f) => f.path !== path));
    const newAliases = { ...fieldAliases };
    delete newAliases[path];
    setFieldAliases(newAliases);
  };

  const handleAliasChange = (path: string, alias: string) => {
    setFieldAliases({ ...fieldAliases, [path]: alias });
    onFieldsChange(
      selectedFields.map((f) =>
        f.path === path ? { ...f, alias, displayName: alias } : f
      )
    );
  };

  const getFieldValue = (field: JsonField): string => {
    if (field.value === null || field.value === undefined) return 'null';
    if (typeof field.value === 'object') return JSON.stringify(field.value).substring(0, 50);
    return String(field.value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Fields to Display
        </label>

        <Input
          placeholder="Search for fields..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-3"
        />

        {displayMode === 'table' && (
          <label className="flex items-center gap-2 mb-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={showArraysOnly}
              onChange={(e) => setShowArraysOnly(e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-dark-800 border-dark-600 rounded focus:ring-primary-500"
            />
            Show arrays only (for table view)
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Available Fields
          </h4>
          <div className="bg-dark-800 rounded-lg border border-dark-600 max-h-64 overflow-y-auto">
            {availableFields.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">
                No available fields
              </p>
            ) : (
              <div className="p-2 space-y-1">
                {availableFields.map((field) => (
                  <div
                    key={field.path}
                    className="flex items-center justify-between p-2 hover:bg-dark-700 rounded transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{field.path}</p>
                      <p className="text-xs text-gray-400">
                        {field.type} • {getFieldValue(field)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddField(field)}
                      className="ml-2 flex-shrink-0"
                    >
                      +
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Selected Fields
          </h4>
          <div className="bg-dark-800 rounded-lg border border-dark-600 max-h-64 overflow-y-auto">
            {selectedFields.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">
                No fields selected
              </p>
            ) : (
              <div className="p-2 space-y-2">
                {selectedFields.map((field) => (
                  <div
                    key={field.path}
                    className="p-2 bg-dark-700 rounded border border-dark-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-white truncate">{field.path}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveField(field.path)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </Button>
                    </div>
                    <Input
                      placeholder="Field alias"
                      value={fieldAliases[field.path] || field.alias || ''}
                      onChange={(e) => handleAliasChange(field.path, e.target.value)}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

