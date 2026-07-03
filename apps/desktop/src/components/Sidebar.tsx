import type { Theme } from '../types';

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  onAddClick: () => void;
  onOpenSettings: () => void;
  onLock: () => void;
  userName?: string;
  theme: Theme;
  onToggleTheme: () => void;
  entryCount: number;
}

export function Sidebar({ query, onQueryChange, onAddClick, onOpenSettings, onLock, userName, theme, onToggleTheme, entryCount }: Props) {
  return (
    <div className="w-64 min-w-64 glass-strong flex flex-col h-screen border-r border-vault-border">
      {/* Header */}
      <div className="px-5 py-5 border-b border-vault-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vault-accent to-vault-accent-light flex items-center justify-center shadow-sm shadow-vault-accent-glow">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-vault-text">Secure Vault</h1>
            <p className="text-xs text-vault-text-muted">{userName || 'User'}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-vault-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="input-modern w-full rounded-xl pl-9 pr-3 py-2 text-xs"
            placeholder="Search entries..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
          {query && (
            <button onClick={() => onQueryChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-vault-text-muted hover:text-vault-text">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <button
          onClick={onAddClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-vault-text-secondary hover:text-vault-text hover:bg-vault-hover transition-all group"
        >
          <span className="w-7 h-7 rounded-lg bg-vault-accent/10 text-vault-accent flex items-center justify-center text-sm group-hover:bg-vault-accent/20 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </span>
          <span>Add Entry</span>
        </button>

        <div className="pt-4 pb-2">
          <p className="text-[10px] font-semibold text-vault-text-muted uppercase tracking-widest px-3">
            Entries {entryCount > 0 && `(${entryCount})`}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-vault-border px-3 py-3 space-y-1">
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-vault-text-secondary hover:text-vault-text hover:bg-vault-hover transition-all"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-vault-text-secondary hover:text-vault-text hover:bg-vault-hover transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Settings
        </button>

        <button
          onClick={onLock}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-vault-danger/70 hover:text-vault-danger hover:bg-vault-danger/5 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Lock Vault
        </button>
      </div>
    </div>
  );
}
