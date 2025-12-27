export type DisplayMode = 'card' | 'table' | 'chart';

export type ChartType = 'line' | 'candle';

export interface JsonField {
  path: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
  children?: JsonField[];
}

export interface SelectedField {
  path: string;
  alias?: string;
  displayName?: string;
}

export interface WidgetConfig {
  id: string;
  name: string;
  apiUrl: string;
  refreshInterval: number; // in seconds
  displayMode: DisplayMode;
  selectedFields: SelectedField[];
  chartType?: ChartType;
  lastUpdated?: number;
  error?: string;
  isLoading?: boolean;
  data?: any;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

export interface DashboardState {
  widgets: WidgetConfig[];
  layout: {
    cols: number;
    rowHeight: number;
  };
}

export interface ApiTestResult {
  success: boolean;
  data?: any;
  fields?: JsonField[];
  error?: string;
  message?: string;
}

