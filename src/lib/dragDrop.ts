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
    // Determine default size based on display mode
    let defaultW = 6; // Cards default to 6 columns
    let defaultH = 4; // Cards default to 4 rows
    let minW = 3;
    let minH = 3;
    
    if (widget.displayMode === 'table') {
      // Tables: wider and taller by default
      defaultW = 10; // Span 10 columns (almost full width on 12-col grid)
      defaultH = 10; // Taller for more rows
      minW = 6; // Minimum width for tables
      minH = 6; // Minimum height for tables
    } else if (widget.displayMode === 'chart') {
      // Charts: wide and tall for visual clarity
      defaultW = 8; // Span 8 columns
      defaultH = 8; // Taller for better visualization
      minW = 5; // Minimum width for charts
      minH = 5; // Minimum height for charts
    }
    
    return {
      i: widget.id,
      x: widget.x ?? (index % 3) * 4, // Better distribution
      y: widget.y ?? Math.floor(index / 3) * 4,
      w: widget.w ?? defaultW,
      h: widget.h ?? defaultH,
      minW,
      minH,
      maxW: 12,
      maxH: 25, // Allow even taller widgets
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

