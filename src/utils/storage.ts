const STORAGE_KEY = 'finboard-dashboard-state';

export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage:`, error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage:`, error);
    }
  },
};

export const getDashboardState = () => {
  return storage.get(STORAGE_KEY);
};

export const saveDashboardState = (state: any) => {
  storage.set(STORAGE_KEY, state);
};

export const exportDashboardConfig = (state: any): string => {
  return JSON.stringify(state, null, 2);
};

export const importDashboardConfig = (json: string): any => {
  try {
    return JSON.parse(json);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
};

