import type { Entry } from '../types';

interface Props {
  entries: Entry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddClick: () => void;
}

export function EntryList({ entries, selectedId, onSelect, onAddClick }: Props) {
  if (entries.length === 0) {
    return (
      <div className="entry-list">
        <div className="entry-list-header">
          <h3>Entries</h3>
        </div>
        <div className="entry-list-empty">
          <p>No entries yet</p>
          <button className="btn-primary btn-sm" onClick={onAddClick} style={{ marginTop: 12 }}>
            Add your first entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="entry-list">
      <div className="entry-list-header">
        <h3>Entries ({entries.length})</h3>
      </div>
      <div className="entry-list-items">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`entry-item ${selectedId === entry.id ? 'selected' : ''}`}
            onClick={() => onSelect(entry.id)}
          >
            <div className="entry-item-title">{entry.title}</div>
            <div className="entry-item-username">{entry.username}</div>
            {entry.url && <div className="entry-item-url">{entry.url}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
