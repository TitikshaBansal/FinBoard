interface CacheEntry {
  data: any;
  timestamp: number;
  url: string;
}

class ApiCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly MAX_AGE = 5 * 60 * 1000; // 5 minutes

  get(url: string): any | null {
    const entry = this.cache.get(url);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > this.MAX_AGE) {
      this.cache.delete(url);
      return null;
    }

    return entry.data;
  }

  set(url: string, data: any): void {
    this.cache.set(url, {
      data,
      timestamp: Date.now(),
      url,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  remove(url: string): void {
    this.cache.delete(url);
  }
}

export const apiCache = new ApiCache();

