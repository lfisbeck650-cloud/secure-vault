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
      <div className="flex-1 flex flex-col bg-[var(--color-vault-dark)]">
        <div className="px-5 py-4 border-b border-vault-border/50">
          <h3 className="text-xs font-semibold text-vault-text-muted uppercase tracking-widest">Entries</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-vault-surface flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-vault-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-sm text-vault-text-secondary mb-3">No entries yet</p>
          <button
            onClick={onAddClick}
            className="btn-modern btn-primary-modern rounded-xl px-4 py-2 text-xs font-semibold"
          >
            Add your first entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-vault-dark)] min-w-0">
      <div className="px-5 py-4 border-b border-vault-border/50 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-vault-text-muted uppercase tracking-widest">
          Entries <span className="text-vault-text-secondary font-normal">({entries.length})</span>
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            onClick={() => onSelect(entry.id)}
            className={`px-5 py-3.5 cursor-pointer border-b border-vault-border/30 transition-all animate-slide-in hover:bg-vault-hover/50 group ${
              selectedId === entry.id
                ? 'bg-vault-accent/5 border-l-2 border-l-vault-accent'
                : 'border-l-2 border-l-transparent'
            }`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all ${
                selectedId === entry.id
                  ? 'bg-vault-accent/20 text-vault-accent'
                  : 'bg-vault-surface text-vault-text-secondary group-hover:bg-vault-hover'
              }`}>
                {entry.title.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-vault-text truncate">{entry.title}</div>
                <div className="text-xs text-vault-text-muted truncate mt-0.5">
                  {entry.username}
                  {entry.url && <span className="mx-1.5">&bull;</span>}
                  {entry.url && <span>{new URL(entry.url).hostname}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
