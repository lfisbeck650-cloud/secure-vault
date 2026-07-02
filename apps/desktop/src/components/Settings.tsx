import { useState } from 'react';
import { exportVault, importVault } from '../tauri';

interface Props {
  vaultPath: string;
  onBack: () => void;
  onLock: () => void;
}

export function Settings({ vaultPath, onBack, onLock }: Props) {
  const [message, setMessage] = useState('');
  const [importData, setImportData] = useState('');

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
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  const handleImport = async () => {
    try {
      await importVault(importData);
      setMessage('Vault imported successfully');
      setImportData('');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="settings-screen">
      <div className="settings-header">
        <button className="btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <h2>Settings</h2>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>Vault</h3>

          <div className="settings-item">
            <div>
              <div className="settings-item-label">Vault Location</div>
              <div className="settings-item-desc">{vaultPath}</div>
            </div>
          </div>

          <div className="settings-item">
            <div>
              <div className="settings-item-label">Export Vault</div>
              <div className="settings-item-desc">Download an encrypted backup</div>
            </div>
            <button className="btn-secondary btn-sm" onClick={handleExport}>
              Export
            </button>
          </div>

          <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
            <div>
              <div className="settings-item-label">Import Vault</div>
              <div className="settings-item-desc">Paste exported vault data</div>
            </div>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste vault JSON here..."
              style={{ width: '100%', minHeight: 80 }}
            />
            <button
              className="btn-secondary btn-sm"
              onClick={handleImport}
              disabled={!importData}
              style={{ alignSelf: 'flex-start' }}
            >
              Import
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Security</h3>

          <div className="settings-item">
            <div>
              <div className="settings-item-label">Lock Vault</div>
              <div className="settings-item-desc">Lock the vault now</div>
            </div>
            <button className="btn-secondary btn-sm" onClick={onLock}>
              Lock
            </button>
          </div>
        </div>

        {message && (
          <div
            style={{
              padding: 12,
              borderRadius: 6,
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              marginTop: 16,
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
