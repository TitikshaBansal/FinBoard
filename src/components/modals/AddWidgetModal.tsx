'use client';

import React, { useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { JsonFieldSelector } from '@/components/json-explorer/JsonFieldSelector';
import { SelectedField, DisplayMode } from '@/types/widget';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addWidget, testApi } = useDashboardStore();
  const [widgetName, setWidgetName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('card');
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    fields?: any[];
  } | null>(null);
  const [apiData, setApiData] = useState<any>(null);

  const handleTestApi = async () => {
    if (!apiUrl.trim()) {
      setTestResult({ success: false, error: 'Please enter an API URL' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testApi(apiUrl);
      setTestResult(result);
      if (result.success && result.data) {
        setApiData(result.data);
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || 'Failed to test API',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddWidget = async () => {
    if (!widgetName.trim()) {
      alert('Please enter a widget name');
      return;
    }

    if (!apiUrl.trim()) {
      alert('Please enter an API URL');
      return;
    }

    if (selectedFields.length === 0) {
      alert('Please select at least one field to display');
      return;
    }

    await addWidget({
      name: widgetName,
      apiUrl: apiUrl.trim(),
      refreshInterval,
      displayMode,
      selectedFields,
    });

    // Reset form
    setWidgetName('');
    setApiUrl('');
    setRefreshInterval(30);
    setDisplayMode('card');
    setSelectedFields([]);
    setTestResult(null);
    setApiData(null);
    onClose();
  };

  const handleClose = () => {
    setWidgetName('');
    setApiUrl('');
    setRefreshInterval(30);
    setDisplayMode('card');
    setSelectedFields([]);
    setTestResult(null);
    setApiData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-dark-800 rounded-lg border border-dark-600 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <h2 className="text-2xl font-bold text-white">Add New Widget</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Widget Name */}
          <Input
            label="Widget Name"
            placeholder="e.g., Bitcoin Price Tracker"
            value={widgetName}
            onChange={(e) => setWidgetName(e.target.value)}
          />

          {/* API URL */}
          <div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="API URL"
                  placeholder="e.g., https://api.coinbase.com/v2/exchange-rates?currency=BTC"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="primary"
                  onClick={handleTestApi}
                  isLoading={isTesting}
                  className="h-[42px]"
                >
                  Test
                </Button>
              </div>
            </div>
            {testResult && (
              <div
                className={`mt-2 p-3 rounded-lg text-sm ${
                  testResult.success
                    ? 'bg-green-900/30 text-green-400 border border-green-800'
                    : 'bg-red-900/30 text-red-400 border border-red-800'
                }`}
              >
                {testResult.success ? (
                  <p>{testResult.message || 'API connection successful'}</p>
                ) : (
                  <p>{testResult.error || 'Failed to connect to API'}</p>
                )}
              </div>
            )}
          </div>

          {/* Refresh Interval */}
          <Input
            label="Refresh interval (seconds)"
            type="number"
            min="5"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 30)}
          />

          {/* Display Mode Selection - Show before field selection */}
          {testResult?.success && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Mode
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDisplayMode('card')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    displayMode === 'card'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  Card
                </button>
                <button
                  onClick={() => setDisplayMode('table')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    displayMode === 'table'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setDisplayMode('chart')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    displayMode === 'chart'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  Chart
                </button>
              </div>
            </div>
          )}

          {/* Field Selection */}
          {testResult?.success && apiData && (
            <JsonFieldSelector
              fields={testResult.fields || []}
              selectedFields={selectedFields}
              onFieldsChange={setSelectedFields}
              displayMode={displayMode}
              onDisplayModeChange={setDisplayMode}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-dark-600">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddWidget}
            disabled={!testResult?.success || selectedFields.length === 0}
          >
            Add Widget
          </Button>
        </div>
      </div>
    </div>
  );
};

