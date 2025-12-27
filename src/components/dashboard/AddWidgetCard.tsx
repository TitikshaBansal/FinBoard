'use client';

import React from 'react';

interface AddWidgetCardProps {
  onClick: () => void;
}

export const AddWidgetCard: React.FC<AddWidgetCardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="h-full bg-dark-800 rounded-lg border-2 border-dashed border-dark-600 hover:border-primary-500 transition-colors cursor-pointer flex flex-col items-center justify-center p-8 min-h-[200px]"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-600/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-primary-500"
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
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-1">Add Widget</h3>
          <p className="text-sm text-gray-400">
            Connect to a finance API and create a custom widget.
          </p>
        </div>
      </div>
    </div>
  );
};

