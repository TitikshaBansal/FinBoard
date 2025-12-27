'use client';

import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { AddWidgetModal } from '@/components/modals/AddWidgetModal';
import { Button } from '@/components/common/Button';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { widgets } = useDashboardStore();

  // Set up auto-refresh for widgets
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    const { refreshWidget } = useDashboardStore.getState();

    widgets.forEach((widget) => {
      if (widget.refreshInterval > 0) {
        const interval = setInterval(() => {
          refreshWidget(widget.id);
        }, widget.refreshInterval * 1000);
        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [widgets]);

  const activeWidgetCount = widgets.length;

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FB</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Finance Dashboard</h1>
              </div>
              <p className="text-sm text-gray-400 ml-11">
                {activeWidgetCount} active widget{activeWidgetCount !== 1 ? 's' : ''} - Real-time data
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Widget
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {widgets.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-4">
                Build Your Finance Dashboard
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Create custom widgets by connecting to any Finance API. Track
                stocks, cryptocurrencies, forex rates, and more in real-time.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsModalOpen(true)}
              >
                Get Started - Add Your First Widget
              </Button>
            </div>
          </div>
        ) : (
          <DashboardGrid onAddWidget={() => setIsModalOpen(true)} />
        )}
      </main>

      {/* Add Widget Modal */}
      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

