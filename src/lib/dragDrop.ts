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
  return widgets.map((widget, index) => {
    // For table and chart widgets, use full width and larger default height
    const isLargeWidget = widget.displayMode === 'table' || widget.displayMode === 'chart';
    
    return {
      i: widget.id,
      x: widget.x ?? (isLargeWidget ? 0 : (index % 2) * 6),
      y: widget.y ?? (isLargeWidget ? index * 12 : Math.floor(index / 2) * 4),
      w: widget.w ?? (isLargeWidget ? 12 : 6), // Full width for tables/charts
      h: widget.h ?? (isLargeWidget ? 12 : 4), // Larger default height for tables/charts
      minW: isLargeWidget ? 6 : 3, // Allow resizing but keep minimum width
      minH: isLargeWidget ? 6 : 3, // Larger minimum for tables/charts
      maxW: 12,
      maxH: 30, // Increased max height to allow expansion
    };
  });
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

