import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WidgetConfig, DashboardState } from '@/types/widget';
import { testApiConnection } from '@/lib/api/fetcher';
import { getTopLevelFields } from '@/lib/api/adapters';
import { apiCache } from '@/lib/api/cache';

interface DashboardStore extends DashboardState {
  addWidget: (widget: Omit<WidgetConfig, 'id' | 'lastUpdated' | 'error' | 'isLoading' | 'data'>) => Promise<void>;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  removeWidget: (id: string) => void;
  updateLayout: (layout: any[]) => void;
  refreshWidget: (id: string) => Promise<void>;
  refreshAllWidgets: () => Promise<void>;
  testApi: (url: string) => Promise<{ success: boolean; data?: any; fields?: any[]; error?: string; message?: string }>;
  exportConfig: () => string;
  importConfig: (config: DashboardState) => void;
}

const generateId = () => `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const fetchWidgetData = async (widget: WidgetConfig): Promise<any> => {
  try {
    // Check cache first
    const cached = apiCache.get(widget.apiUrl);
    if (cached) {
      return cached;
    }

    const data = await testApiConnection(widget.apiUrl);
    apiCache.set(widget.apiUrl, data);
    return data;
  } catch (error: any) {
    throw error;
  }
};

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      widgets: [],
      layout: {
        cols: 12,
        rowHeight: 30,
      },

      addWidget: async (widgetData) => {
        // Set initial dimensions based on display mode
        const isLargeWidget = widgetData.displayMode === 'table' || widgetData.displayMode === 'chart';
        const existingWidgets = get().widgets;
        
        // Calculate Y position: stack large widgets, or use grid for cards
        let initialY = 0;
        if (isLargeWidget) {
          // Find the bottom of the last large widget
          const largeWidgets = existingWidgets.filter(w => w.displayMode === 'table' || w.displayMode === 'chart');
          if (largeWidgets.length > 0) {
            initialY = largeWidgets.reduce((max, w) => Math.max(max, (w.y || 0) + (w.h || 12)), 0);
          }
        } else {
          // Card widgets: use grid positioning
          const cardWidgets = existingWidgets.filter(w => w.displayMode !== 'table' && w.displayMode !== 'chart');
          initialY = Math.floor(cardWidgets.length / 2) * 4;
        }
        
        const newWidget: WidgetConfig = {
          ...widgetData,
          id: generateId(),
          x: isLargeWidget ? 0 : (existingWidgets.filter(w => w.displayMode !== 'table' && w.displayMode !== 'chart').length % 2) * 6,
          y: initialY,
          w: isLargeWidget ? 12 : 6, // Full width for tables/charts
          h: isLargeWidget ? 12 : 4, // Larger height for tables/charts
          isLoading: true,
          error: undefined,
        };

        set((state) => ({
          widgets: [...state.widgets, newWidget],
        }));

        // Fetch initial data
        try {
          const data = await fetchWidgetData(newWidget);
          set((state) => ({
            widgets: state.widgets.map((w) =>
              w.id === newWidget.id
                ? { ...w, data, isLoading: false, lastUpdated: Date.now() }
                : w
            ),
          }));
        } catch (error: any) {
          set((state) => ({
            widgets: state.widgets.map((w) =>
              w.id === newWidget.id
                ? { ...w, error: error.message, isLoading: false }
                : w
            ),
          }));
        }
      },

      updateWidget: (id, updates) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }));
      },

      removeWidget: (id) => {
        const widget = get().widgets.find((w) => w.id === id);
        if (widget) {
          apiCache.remove(widget.apiUrl);
        }
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        }));
      },

      updateLayout: (layout) => {
        set((state) => {
          const updatedWidgets = state.widgets.map((widget) => {
            const layoutItem = layout.find((item: any) => item.i === widget.id);
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

          return { widgets: updatedWidgets };
        });
      },

      refreshWidget: async (id) => {
        const widget = get().widgets.find((w) => w.id === id);
        if (!widget) return;

        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, isLoading: true, error: undefined } : w
          ),
        }));

        try {
          // Clear cache for this widget to force fresh data
          apiCache.remove(widget.apiUrl);
          const data = await fetchWidgetData(widget);
          set((state) => ({
            widgets: state.widgets.map((w) =>
              w.id === id
                ? { ...w, data, isLoading: false, lastUpdated: Date.now(), error: undefined }
                : w
            ),
          }));
        } catch (error: any) {
          set((state) => ({
            widgets: state.widgets.map((w) =>
              w.id === id
                ? { ...w, error: error.message, isLoading: false }
                : w
            ),
          }));
        }
      },

      refreshAllWidgets: async () => {
        const { widgets } = get();
        const refreshPromises = widgets.map((widget) => get().refreshWidget(widget.id));
        await Promise.allSettled(refreshPromises);
      },

      testApi: async (url) => {
        try {
          const data = await testApiConnection(url);
          const fields = getTopLevelFields(data);
          
          return {
            success: true,
            data,
            fields,
            message: `API connection successful ${fields.length} top-level fields found`,
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message || 'Failed to connect to API',
          };
        }
      },

      exportConfig: () => {
        const state = get();
        return JSON.stringify(
          {
            widgets: state.widgets.map((w) => ({
              ...w,
              data: undefined, // Don't export data, just config
              isLoading: false,
              error: undefined,
            })),
            layout: state.layout,
          },
          null,
          2
        );
      },

      importConfig: (config) => {
        set(config);
      },
    }),
    {
      name: 'finboard-dashboard-state',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return {
            getItem: (name: string) => {
              const value = window.localStorage.getItem(name);
              return value ? JSON.parse(value) : null;
            },
            setItem: (name: string, value: any) => {
              window.localStorage.setItem(name, JSON.stringify(value));
            },
            removeItem: (name: string) => {
              window.localStorage.removeItem(name);
            },
          };
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        widgets: state.widgets.map((w) => ({
          ...w,
          data: undefined,
          isLoading: false,
          error: undefined,
        })),
        layout: state.layout,
      }),
    }
  )
);

