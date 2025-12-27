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
    <div className="h-full w-full bg-dark-800 rounded-xl border border-dark-600/50 shadow-sm flex flex-col overflow-hidden">
      {/* Header - Compact */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-dark-600/50 relative z-10 bg-dark-800/50">
        <div className="flex items-center gap-2 drag-handle cursor-move flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white truncate">{widget.name}</h3>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0" style={{ pointerEvents: 'auto', zIndex: 20 }}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRefresh();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="p-1.5 text-gray-400 hover:text-primary-400 transition-colors rounded hover:bg-dark-700/50 relative z-20"
            title="Refresh"
            type="button"
          >
            <svg
              className="w-4 h-4"
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
              e.preventDefault();
              e.stopPropagation();
              handleRemove();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded hover:bg-dark-700/50 relative z-20"
            title="Remove"
            type="button"
          >
            <svg
              className="w-4 h-4"
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
      <div className="flex-1 overflow-auto px-4 py-3 min-h-0">
        {widget.isLoading ? (
          <LoadingState message="Loading data..." />
        ) : widget.error ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="text-red-400/70 mb-2">
              <svg
                className="w-10 h-10"
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
            <p className="text-red-400/80 text-sm text-center mb-3">{widget.error}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer - Separated */}
      {widget.lastUpdated && !widget.isLoading && !widget.error && (
        <div className="px-4 py-2 border-t border-dark-600/50 bg-dark-800/30">
          <p className="text-xs text-gray-500 uppercase tracking-wider text-center font-medium">
            Last updated: {formatDate(widget.lastUpdated)}
          </p>
        </div>
      )}
    </div>
  );
};

