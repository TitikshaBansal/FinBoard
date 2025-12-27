'use client';

import React, { useMemo } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { useDashboardStore } from '@/store/dashboardStore';
import { WidgetRenderer } from './WidgetRenderer';
import { AddWidgetCard } from './AddWidgetCard';
import { generateLayout } from '@/lib/dragDrop';
import 'react-grid-layout/css/styles.css';
import 'react-grid-layout/css/resizable.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  onAddWidget: () => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ onAddWidget }) => {
  const { widgets, updateLayout, layout } = useDashboardStore();

  const gridLayout = useMemo(() => {
    const layout = generateLayout(widgets);
    // Add the add-widget card to the layout
    const addWidgetLayout = {
      i: 'add-widget',
      x: (widgets.length % 2) * 6,
      y: Math.floor(widgets.length / 2) * 4,
      w: 6,
      h: 4,
      minW: 3,
      minH: 3,
      maxW: 12,
      maxH: 10,
    };
    return [...layout, addWidgetLayout];
  }, [widgets]);

  const handleLayoutChange = (currentLayout: Layout[], allLayouts: any) => {
    // Filter out the add-widget from layout updates
    const widgetLayouts = currentLayout.filter((item) => item.i !== 'add-widget');
    updateLayout(widgetLayouts);
  };

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
        rowHeight={layout.rowHeight}
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        draggableHandle=".drag-handle"
        margin={[16, 16]}
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="h-full">
            <WidgetRenderer widget={widget} />
          </div>
        ))}
        <div key="add-widget" className="h-full">
          <AddWidgetCard onClick={onAddWidget} />
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};

