'use client';

import React from 'react';

interface AddWidgetCardProps {
  onClick: () => void;
}

export const AddWidgetCard: React.FC<AddWidgetCardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="h-full w-full bg-dark-800 rounded-xl border-2 border-dashed border-dark-600/50 hover:border-primary-500/50 hover:bg-dark-800/80 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-6 group"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary-600/10 group-hover:bg-primary-600/20 flex items-center justify-center transition-colors">
          <svg
            className="w-6 h-6 text-primary-500"
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
          <h3 className="text-base font-semibold text-white mb-1">Add Widget</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Connect to a finance API and create a custom widget.
          </p>
        </div>
      </div>
    </div>
  );
};

