'use client';

import React, { useMemo } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { useDashboardStore } from '@/store/dashboardStore';
import { WidgetRenderer } from './WidgetRenderer';
import { AddWidgetCard } from './AddWidgetCard';
import { generateLayout } from '@/lib/dragDrop';
import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  onAddWidget: () => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ onAddWidget }) => {
  const { widgets, updateLayout, layout } = useDashboardStore();

  const gridLayout = useMemo(() => {
    const generatedWidgetLayouts = generateLayout(widgets);
    
    // Config for the pinned "Add Widget" card
    const addWidgetLayout = {
      i: 'add-widget',
      x: 0, // Always start at the left
      y: 0, // Always start at the top
      w: 6, // Width (adjust based on your grid columns)
      h: 4, // Height
      minW: 3,
      minH: 3,
      static: true // TRUE = Pinned (cannot be dragged/moved). Set to false if you want to drag it.
    };

    // Return Add Widget FIRST, followed by the rest
    return [addWidgetLayout, ...generatedWidgetLayouts];
  }, [widgets]);

  const handleLayoutChange = (currentLayout: Layout[]) => {
    // Filter out the add-widget from layout updates so it doesn't get saved to the store
    const widgetLayouts = currentLayout.filter((item) => item.i !== 'add-widget');
    updateLayout(widgetLayouts);
  };

  // If no widgets exist, show just the Add button (simplified view)
  if (widgets.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AddWidgetCard onClick={onAddWidget} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: gridLayout, md: gridLayout, sm: gridLayout, xs: gridLayout, xxs: gridLayout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={layout.rowHeight || 150} // Fallback row height if undefined
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        draggableHandle=".drag-handle"
        margin={[16, 16]}
      >
        {/* 1. The Pinned Add Widget Card comes first */}
        <div key="add-widget" className="h-full">
          <AddWidgetCard onClick={onAddWidget} />
        </div>

        {/* 2. Then render all user widgets */}
        {widgets.map((widget) => (
          <div key={widget.id} className="h-full">
            <WidgetRenderer widget={widget} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};