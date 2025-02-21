import React, { useState } from 'react';
import { urlApi } from '../services/api';
import { Link } from 'react-router-dom';
import { useUrlList } from '../hooks/useUrlList';
import { useAuth } from '../contexts/AuthContext';

// Get the base URL for shortened links (without /api)
const SHORTENER_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:4001';

export const UrlShortener: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { refreshUrls } = useUrlList();
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await urlApi.create(url, customSlug || undefined);
      if (response.status === 'success' && response.data) {
        setShortUrl(`${SHORTENER_BASE_URL}/${response.data.shortSlug}`);
        setSuccess(true);
        setUrl('');
        setCustomSlug('');
        // If logged in, refresh the URL list
        if (isAuthenticated) {
          await refreshUrls();
        }
      } else {
        setError(response.message || 'Failed to shorten URL');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      alert('URL copied to clipboard!');
    } catch (err) {
      setError('Failed to copy URL');
    }
  };

  return (
    <div className="container">
      <h1>URL Shortener</h1>
      <p>Enter the URL to shorten</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="url">URL</label>
          <input
            id="url"
            name="url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/foo/bar/biz"
            className="input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="customSlug">Custom Slug (Optional)</label>
          <input
            id="customSlug"
            name="customSlug"
            type="text"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            placeholder="my-custom-url"
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="button"
        >
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </form>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {success && (
        <div className="success">
          <h2>Success! Here's your URL:</h2>
          <div className="copy-container">
            <input
              type="text"
              value={shortUrl}
              readOnly
              className="copy-input"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="copy-button"
            >
              Copy
            </button>
          </div>
          <p className="success-note">
            <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="url-link">Click here</a> to open in a new tab
          </p>
          {isAuthenticated ? (
            <p className="success-note">
              Your URL has been added to <Link to="/urls" className="login-link">your list</Link>!
            </p>
          ) : (
            <p className="login-note">
              <Link to="/login" className="login-link">Log in</Link> or <Link to="/register" className="login-link">register</Link> to manage your URLs and see visit statistics!
            </p>
          )}
        </div>
      )}
    </div>
  );
}; 