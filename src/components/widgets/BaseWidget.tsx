'use client';

import React from 'react';
import { WidgetConfig } from '@/types/widget';
import { formatDate } from '@/lib/formatting';
import { Button } from '@/components/common/Button';
import { LoadingState } from '@/components/common/LoadingState';
import { useDashboardStore } from '@/store/dashboardStore';

interface BaseWidgetProps {
  widget: WidgetConfig;
  children: React.ReactNode;
}

export const BaseWidget: React.FC<BaseWidgetProps> = ({ widget, children }) => {
  const { removeWidget, refreshWidget } = useDashboardStore();

  const handleRefresh = () => {
    refreshWidget(widget.id);
  };

  const handleRemove = () => {
    if (confirm('Are you sure you want to remove this widget?')) {
      removeWidget(widget.id);
    }
  };

  return (
    <div className="h-full bg-dark-800 rounded-lg border border-dark-600 shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-600 drag-handle cursor-move">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">{widget.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            className="p-1.5 text-gray-400 hover:text-primary-400 transition-colors"
            title="Refresh"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
            title="Remove"
          >
            <svg
              className="w-5 h-5"
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {widget.isLoading ? (
          <LoadingState message="Loading data..." />
        ) : widget.error ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="text-red-400 mb-2">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-red-400 text-sm text-center">{widget.error}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer */}
      {widget.lastUpdated && !widget.isLoading && !widget.error && (
        <div className="px-4 py-2 border-t border-dark-600">
          <p className="text-xs text-gray-500">
            Last updated: {formatDate(widget.lastUpdated)}
          </p>
        </div>
      )}
    </div>
  );
};

