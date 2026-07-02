interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  onAddClick: () => void;
  onOpenSettings: () => void;
  onLock: () => void;
}

export function Sidebar({ query, onQueryChange, onAddClick, onOpenSettings, onLock }: Props) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Secure Vault</h2>
      </div>

      <div className="sidebar-search">
        <input
          placeholder="Search entries..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div className="sidebar-nav">
        <div className="nav-item active" onClick={onAddClick}>
          <span>+</span>
          <span>Add Entry</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="btn-ghost btn-sm" onClick={onOpenSettings}>
          Settings
        </button>
        <button className="btn-ghost btn-sm" onClick={onLock}>
          Lock
        </button>
      </div>
    </div>
  );
}
