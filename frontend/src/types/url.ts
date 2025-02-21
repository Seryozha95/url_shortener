export interface Url {
  id: string;
  originalUrl: string;
  shortSlug: string;
  customSlug?: string;
  visitCount: number;
  createdAt: string;
  updatedAt: string;
  analytics?: Analytics[];
}

export interface Analytics {
  id: string;
  visitedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
} 