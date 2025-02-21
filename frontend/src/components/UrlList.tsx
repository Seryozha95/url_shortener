import React, { useState } from 'react';
import { useUrlList } from '../hooks/useUrlList';

// Get the base URL for shortened links (without /api)
const SHORTENER_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:4001';

export const UrlList: React.FC = () => {
  const { urls, loading, error, deleteUrl, updateUrl } = useUrlList();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSlug, setNewSlug] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const handleEdit = async (id: string) => {
    try {
      await updateUrl(id, newSlug);
      setEditingId(null);
      setNewSlug('');
      setEditError(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update URL');
    }
  };

  const startEditing = (id: string, currentSlug: string) => {
    setEditingId(id);
    setNewSlug(currentSlug);
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewSlug('');
    setEditError(null);
  };

  const handleCopy = async (shortSlug: string) => {
    try {
      await navigator.clipboard.writeText(`${SHORTENER_BASE_URL}/${shortSlug}`);
      alert('URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (error) {
    return <div className="container error">{error}</div>;
  }

  return (
    <div className="container">
      <h1>My URLs</h1>
      {urls.length === 0 ? (
        <p>No URLs found. Create your first shortened URL!</p>
      ) : (
        <div className="url-list">
          {urls.map((url) => {
            const shortUrl = `${SHORTENER_BASE_URL}/${url.shortSlug}`;
            const isEditing = editingId === url.id;

            return (
              <div key={url.id} className="url-item">
                <div className="url-details">
                  <p className="original-url">{url.originalUrl}</p>
                  {isEditing ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value)}
                        className="input"
                        placeholder="Enter new custom slug"
                      />
                      {editError && <p className="error-text">{editError}</p>}
                      <div className="edit-actions">
                        <button
                          onClick={() => handleEdit(url.id)}
                          className="save-button"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="cancel-button"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="short-url">
                        Short URL: <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="url-link">{shortUrl}</a>
                        {url.customSlug && (
                          <span className="custom-slug">
                            Custom: <a href={`${SHORTENER_BASE_URL}/${url.customSlug}`} target="_blank" rel="noopener noreferrer" className="url-link">{`${SHORTENER_BASE_URL}/${url.customSlug}`}</a>
                          </span>
                        )}
                      </p>
                      <div className="url-stats">
                        <span>Visits: {url.visitCount}</span>
                        <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="url-actions">
                  {!isEditing && (
                    <>
                      <button
                        onClick={() => handleCopy(url.shortSlug)}
                        className="copy-button"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => startEditing(url.id, url.shortSlug)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUrl(url.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}; 