import { useState, useEffect } from 'react';
import { urlApi } from '../services/api';
import { Url } from '../types/url';

interface UseUrlListReturn {
  urls: Url[];
  loading: boolean;
  error: string | null;
  deleteUrl: (id: string) => Promise<void>;
  refreshUrls: () => Promise<void>;
  updateUrl: (id: string, customSlug: string) => Promise<void>;
}

export const useUrlList = (): UseUrlListReturn => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUrls = async () => {
    try {
      const response = await urlApi.getAll();
      if (response.status === 'success' && response.data) {
        setUrls(response.data);
      } else {
        setError(response.message || 'Failed to fetch URLs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch URLs');
    } finally {
      setLoading(false);
    }
  };

  const deleteUrl = async (id: string) => {
    try {
      await urlApi.delete(id);
      setUrls(urls.filter(url => url.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete URL');
    }
  };

  const updateUrl = async (id: string, customSlug: string) => {
    try {
      const response = await urlApi.update(id, customSlug);
      if (response.status === 'success' && response.data) {
        setUrls(urls.map(url => url.id === id ? { ...url, ...response.data } : url));
      } else {
        throw new Error(response.message || 'Failed to update URL');
      }
    } catch (err) {
      throw err;
    }
  };

  const refreshUrls = async () => {
    setLoading(true);
    await fetchUrls();
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  return {
    urls,
    loading,
    error,
    deleteUrl,
    refreshUrls,
    updateUrl
  };
}; 