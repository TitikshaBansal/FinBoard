// Utility functions for drag and drop
// Using react-grid-layout for grid-based drag and drop

export interface GridLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export const generateLayout = (widgets: any[]): GridLayout[] => {
  return widgets.map((widget, index) => ({
    i: widget.id,
    x: widget.x ?? (index % 2) * 6,
    y: widget.y ?? Math.floor(index / 2) * 4,
    w: widget.w ?? 6,
    h: widget.h ?? (widget.displayMode === 'table' ? 8 : widget.displayMode === 'chart' ? 6 : 4), // Dynamic heights
    minW: 3,
    minH: 3,
    maxW: 12,
    maxH: 20, // Allow taller widgets for tables
  }));
};

export const updateWidgetLayout = (
  widgets: any[],
  layout: GridLayout[]
): any[] => {
  return widgets.map(widget => {
    const layoutItem = layout.find(item => item.i === widget.id);
    if (layoutItem) {
      return {
        ...widget,
        x: layoutItem.x,
        y: layoutItem.y,
        w: layoutItem.w,
        h: layoutItem.h,
      };
    }
    return widget;
  });
};

