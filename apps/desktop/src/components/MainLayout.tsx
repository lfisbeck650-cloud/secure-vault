import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { EntryList } from './EntryList';
import { EntryDetail } from './EntryDetail';
import { PasswordGenerator } from './PasswordGenerator';
import { getEntries, searchEntries, addEntry, updateEntry, deleteEntry, getUserName } from '../tauri';
import type { Entry } from '../types';

interface Props {
  onLock: () => void;
  onOpenSettings: () => void;
}

export function MainLayout({ onLock, onOpenSettings }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userName, setUserName_] = useState('');

  const loadEntries = useCallback(async () => {
    try {
      const data = query ? await searchEntries(query) : await getEntries();
      setEntries(data);
    } catch {
      setEntries([]);
    }
  }, [query]);

  useEffect(() => {
    loadEntries();
    getUserName().then(setUserName_).catch(() => {});
  }, [loadEntries]);

  const selected = entries.find((e) => e.id === selectedId) || null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleSave = async (
    id: string,
    title: string,
    username: string,
    password: string | null,
    url: string | null,
    notes: string | null
  ) => {
    await updateEntry(id, title, username, password, url, notes);
    await loadEntries();
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
    if (selectedId === id) setSelectedId(null);
    await loadEntries();
  };

  const handleAdd = async (title: string, username: string, password: string) => {
    await addEntry(title, username, password);
    setShowAddModal(false);
    await loadEntries();
  };

  return (
    <div className="main-layout">
      <Sidebar
        query={query}
        onQueryChange={setQuery}
        onAddClick={() => setShowAddModal(true)}
        onOpenSettings={onOpenSettings}
        onLock={onLock}
        userName={userName}
      />
      <div className="content">
        <EntryList
          entries={entries}
          selectedId={selectedId}
          onSelect={handleSelect}
          onAddClick={() => setShowAddModal(true)}
        />
        <EntryDetail
          entry={selected}
          onSave={handleSave}
          onDelete={handleDelete}
          onGenerate={() => setShowGenerator(true)}
        />
      </div>

      {showGenerator && (
        <PasswordGenerator onClose={() => setShowGenerator(false)} />
      )}

      {showAddModal && (
        <AddEntryModal
          onSave={handleAdd}
          onCancel={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function AddEntryModal({
  onSave,
  onCancel,
}: {
  onSave: (title: string, username: string, password: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !username || !password) return;
    onSave(title, username, password);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add Entry</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button className="btn-secondary" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn-primary" type="submit">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
