import { useState } from 'react';
import { exportVault, importVault } from '../tauri';
import type { Theme } from '../types';

interface Props {
  vaultPath: string;
  theme: Theme;
  onToggleTheme: () => void;
  onBack: () => void;
  onLock: () => void;
}

export function Settings({ vaultPath, theme, onToggleTheme, onBack, onLock }: Props) {
  const [message, setMessage] = useState('');
  const [importData, setImportData] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  const handleExport = async () => {
    try {
      const data = await exportVault();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vault-export.json';
      a.click();
      URL.revokeObjectURL(url);
      setMessage('Vault exported successfully');
      setMsgType('success');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : String(err));
      setMsgType('error');
    }
  };

  const handleImport = async () => {
    try {
      await importVault(importData);
      setMessage('Vault imported successfully');
      setMsgType('success');
      setImportData('');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : String(err));
      setMsgType('error');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--color-vault-dark)]">
      {/* Header */}
      <div className="glass-strong border-b border-vault-border px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="btn-modern btn-ghost-modern rounded-xl p-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h2 className="text-lg font-bold text-vault-text">Settings</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
          {/* Appearance */}
          <Section title="Appearance">
            <SettingRow label="Theme" description="Switch between dark and light mode">
              <button
                onClick={onToggleTheme}
                className="btn-modern btn-secondary-modern rounded-xl px-4 py-2 text-sm flex items-center gap-2"
              >
                {theme === 'dark' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    Light Mode
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    Dark Mode
                  </>
                )}
              </button>
            </SettingRow>
          </Section>

          {/* Vault */}
          <Section title="Vault">
            <SettingRow label="Vault Location" description={vaultPath} />

            <SettingRow label="Export Vault" description="Download an encrypted backup">
              <button onClick={handleExport} className="btn-modern btn-secondary-modern rounded-xl px-4 py-2 text-sm font-medium">
                Export
              </button>
            </SettingRow>

            <SettingRow label="Import Vault" description="Paste exported vault data" vertical>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste vault JSON here..."
                className="input-modern w-full rounded-xl px-4 py-2.5 text-sm resize-none min-h-[80px]"
              />
              <button
                onClick={handleImport}
                disabled={!importData}
                className="btn-modern btn-secondary-modern rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed self-start mt-2"
              >
                Import
              </button>
            </SettingRow>
          </Section>

          {/* Security */}
          <Section title="Security">
            <SettingRow label="Lock Vault" description="Lock the vault now">
              <button onClick={onLock} className="btn-modern btn-danger-modern rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Lock
              </button>
            </SettingRow>
          </Section>

          {/* About */}
          <Section title="About">
            <div className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vault-accent to-vault-accent-light flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-vault-text">Secure Vault</p>
                <p className="text-xs text-vault-text-muted">v0.2.0 &bull; Zero-Knowledge Password Manager</p>
              </div>
            </div>
          </Section>

          {/* Message toast */}
          {message && (
            <div className={`rounded-xl px-5 py-3 text-sm border ${
              msgType === 'success'
                ? 'bg-vault-success/10 text-vault-success border-vault-success/20'
                : 'bg-vault-danger/10 text-vault-danger border-vault-danger/20'
            } animate-fade-in`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-vault-text-muted uppercase tracking-widest mb-4">{title}</h3>
      <div className="glass rounded-2xl p-5 space-y-1">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, description, children, vertical }: {
  label: string;
  description?: string;
  children?: React.ReactNode;
  vertical?: boolean;
}) {
  return (
    <div className={`flex ${vertical ? 'flex-col items-stretch' : 'items-center justify-between'} py-2 ${vertical ? '' : 'gap-4'}`}>
      <div className={vertical ? 'mb-1' : ''}>
        <div className="text-sm font-medium text-vault-text">{label}</div>
        {description && <div className="text-xs text-vault-text-muted mt-0.5">{description}</div>}
      </div>
      {children}
    </div>
  );
}
