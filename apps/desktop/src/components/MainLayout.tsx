import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { EntryList } from './EntryList';
import { EntryDetail } from './EntryDetail';
import { PasswordGenerator } from './PasswordGenerator';
import { getEntries, searchEntries, addEntry, updateEntry, deleteEntry, getUserName } from '../tauri';
import type { Entry, Theme } from '../types';

interface Props {
  onLock: () => void;
  onOpenSettings: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function MainLayout({ onLock, onOpenSettings, theme, onToggleTheme }: Props) {
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
    <div className="flex h-screen bg-[var(--color-vault-dark)] overflow-hidden">
      <Sidebar
        query={query}
        onQueryChange={setQuery}
        onAddClick={() => setShowAddModal(true)}
        onOpenSettings={onOpenSettings}
        onLock={onLock}
        userName={userName}
        theme={theme}
        onToggleTheme={onToggleTheme}
        entryCount={entries.length}
      />
      <div className="flex flex-1 min-w-0">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onCancel}>
      <div className="glass rounded-2xl p-6 w-full max-w-sm mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vault-accent to-vault-accent-light flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          <h3 className="text-lg font-bold text-vault-text">Add Entry</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-vault-text-secondary mb-1.5 tracking-wide">TITLE</label>
            <input className="input-modern w-full rounded-xl px-4 py-2.5 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-vault-text-secondary mb-1.5 tracking-wide">USERNAME</label>
            <input className="input-modern w-full rounded-xl px-4 py-2.5 text-sm" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-vault-text-secondary mb-1.5 tracking-wide">PASSWORD</label>
            <input className="input-modern w-full rounded-xl px-4 py-2.5 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onCancel} className="btn-modern btn-secondary-modern rounded-xl flex-1 py-2.5 text-sm font-medium">
              Cancel
            </button>
            <button type="submit" className="btn-modern btn-primary-modern rounded-xl flex-1 py-2.5 text-sm font-medium">
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
