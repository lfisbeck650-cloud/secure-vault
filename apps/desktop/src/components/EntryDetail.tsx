import { useState, useEffect, useCallback } from 'react';
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

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setClearing(true);
      setTimeout(() => {
        setCopied(false);
        setClearing(false);
        navigator.clipboard.writeText('').catch(() => {});
      }, 15000);
    } catch {
      // ignore
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        copied
          ? 'bg-vault-success/15 text-vault-success border border-vault-success/20'
          : 'text-vault-text-secondary hover:text-vault-text hover:bg-vault-hover border border-transparent'
      }`}
    >
      {copied ? (
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {clearing ? 'Copied!' : 'Copied'}
        </span>
      ) : (
        label || 'Copy'
      )}
    </button>
  );
}

export function EntryDetail({ entry, onSave, onDelete, onGenerate }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setUsername(entry.username);
      setPassword(entry.password || '');
      setUrl(entry.url || '');
      setNotes(entry.notes || '');
    }
    setEditing(false);
    setConfirmDelete(false);
  }, [entry]);

  if (!entry) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--color-vault-dark)]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-vault-surface flex items-center justify-center">
            <svg className="w-7 h-7 text-vault-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <p className="text-sm text-vault-text-muted">Select an entry to view details</p>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex-1 overflow-y-auto bg-[var(--color-vault-dark)] p-6 animate-fade-in">
        <div className="max-w-lg">
          <h2 className="text-lg font-bold text-vault-text mb-6">Edit Entry</h2>
          <div className="space-y-4">
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
              <div className="flex gap-2">
                <input className="input-modern flex-1 rounded-xl px-4 py-2.5 text-sm" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button onClick={() => setShowPassword(!showPassword)} className="btn-modern btn-secondary-modern rounded-xl px-3 text-xs">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                <button onClick={onGenerate} className="btn-modern btn-secondary-modern rounded-xl px-3 text-xs">
                  Generate
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-vault-text-secondary mb-1.5 tracking-wide">URL</label>
              <input className="input-modern w-full rounded-xl px-4 py-2.5 text-sm" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-vault-text-secondary mb-1.5 tracking-wide">NOTES</label>
              <textarea className="input-modern w-full rounded-xl px-4 py-2.5 text-sm resize-none min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 mt-8 pt-6 border-t border-vault-border/50">
            <button onClick={() => setEditing(false)} className="btn-modern btn-secondary-modern rounded-xl px-5 py-2 text-sm font-medium">
              Cancel
            </button>
            <button onClick={() => {
              onSave(entry.id, title, username, password || null, url || null, notes || null);
              setEditing(false);
            }} className="btn-modern btn-primary-modern rounded-xl px-5 py-2 text-sm font-medium">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--color-vault-dark)] p-6 animate-fade-in">
      <div className="max-w-lg">
        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-vault-accent to-vault-accent-light flex items-center justify-center text-white text-lg font-bold shadow-sm shadow-vault-accent-glow shrink-0">
            {entry.title.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h2 className="text-xl font-bold text-vault-text truncate">{entry.title}</h2>
            <p className="text-xs text-vault-text-muted mt-0.5">
              Updated {new Date(entry.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-5">
          <Field label="Username" value={entry.username} actions={<CopyButton text={entry.username} />} />
          <Field label="Password" value={showPassword ? entry.password || '' : '••••••••'} obscured={!showPassword}>
            <div className="flex gap-1.5">
              <button onClick={() => setShowPassword(!showPassword)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-vault-text-secondary hover:text-vault-text hover:bg-vault-hover border border-transparent transition-all">
                {showPassword ? 'Hide' : 'Show'}
              </button>
              {entry.password && <CopyButton text={entry.password} />}
            </div>
          </Field>
          {entry.url && <Field label="URL" value={entry.url} actions={<CopyButton text={entry.url} />} />}
          {entry.notes && (
            <div>
              <label className="block text-xs font-medium text-vault-text-secondary mb-1.5 tracking-wide">NOTES</label>
              <div className="bg-vault-surface rounded-xl px-4 py-3 border border-vault-border/30">
                <p className="text-sm text-vault-text leading-relaxed whitespace-pre-wrap">{entry.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-8 pt-6 border-t border-vault-border/50">
          <button
            onClick={() => setEditing(true)}
            className="btn-modern btn-secondary-modern rounded-xl px-5 py-2 text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Edit
            </span>
          </button>
          {confirmDelete ? (
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="btn-modern btn-secondary-modern rounded-xl px-4 py-2 text-xs font-medium">
                Cancel
              </button>
              <button onClick={() => onDelete(entry.id)} className="btn-modern btn-danger-modern rounded-xl px-4 py-2 text-xs font-medium">
                Confirm Delete
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="btn-modern btn-danger-modern rounded-xl px-5 py-2 text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, children, obscured, actions }: {
  label: string;
  value: string;
  children?: React.ReactNode;
  obscured?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-vault-text-secondary mb-1.5 tracking-wide">{label}</label>
      <div className="bg-vault-surface rounded-xl px-4 py-3 border border-vault-border/30 flex items-center gap-2">
        <span className={`flex-1 text-sm font-mono ${obscured ? 'tracking-wider' : ''} text-vault-text truncate`}>
          {value}
        </span>
        {children || (actions && <div className="flex gap-1.5 shrink-0">{actions}</div>)}
      </div>
    </div>
  );
}
