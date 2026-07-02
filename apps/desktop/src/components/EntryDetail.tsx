import { useState, useEffect } from 'react';
import type { Entry } from '../types';

interface Props {
  entry: Entry | null;
  onSave: (
    id: string,
    title: string,
    username: string,
    password: string | null,
    url: string | null,
    notes: string | null
  ) => void;
  onDelete: (id: string) => void;
  onGenerate: () => void;
}

export function EntryDetail({ entry, onSave, onDelete, onGenerate }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setUsername(entry.username);
      setPassword(entry.password || '');
      setUrl(entry.url || '');
      setNotes(entry.notes || '');
    }
    setEditing(false);
  }, [entry]);

  if (!entry) {
    return (
      <div className="entry-detail">
        <div className="entry-detail-empty">
          <p>Select an entry to view details</p>
        </div>
      </div>
    );
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback
    }
  };

  const handleSave = () => {
    onSave(entry.id, title, username, password || null, url || null, notes || null);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="entry-detail">
        <h2>Edit Entry</h2>
        <div className="form-group">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="btn-secondary btn-sm" onClick={onGenerate}>
              Generate
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>URL</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="detail-actions">
          <button className="btn-secondary" onClick={() => setEditing(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="entry-detail">
      <h2>{entry.title}</h2>

      <div className="detail-field">
        <label>Username</label>
        <div className="detail-field-value">
          <span className="value-text">{entry.username}</span>
          <button className="btn-ghost btn-sm" onClick={() => handleCopy(entry.username)}>
            Copy
          </button>
        </div>
      </div>

      <div className="detail-field">
        <label>Password</label>
        <div className="detail-field-value">
          <span className="value-text">
            {showPassword ? entry.password || '' : '••••••••'}
          </span>
          <button
            className="btn-ghost btn-sm"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
          <button
            className="btn-ghost btn-sm"
            onClick={() => entry.password && handleCopy(entry.password)}
          >
            Copy
          </button>
        </div>
      </div>

      {entry.url && (
        <div className="detail-field">
          <label>URL</label>
          <div className="detail-field-value">
            <span className="value-text">{entry.url}</span>
            <button className="btn-ghost btn-sm" onClick={() => handleCopy(entry.url!)}>
              Copy
            </button>
          </div>
        </div>
      )}

      {entry.notes && (
        <div className="detail-field">
          <label>Notes</label>
          <div className="detail-field-value" style={{ fontFamily: 'inherit' }}>
            <span className="value-text">{entry.notes}</span>
          </div>
        </div>
      )}

      <div className="detail-actions">
        <button className="btn-secondary" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button className="btn-danger" onClick={() => onDelete(entry.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
