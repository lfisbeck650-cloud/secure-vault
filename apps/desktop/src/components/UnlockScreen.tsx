import { useState, useEffect } from 'react';
import { createVault, unlockVault, vaultExists } from '../tauri';

interface Props {
  onUnlocked: (path: string) => void;
}

export function UnlockScreen({ onUnlocked }: Props) {
  const [mode, setMode] = useState<'unlock' | 'create'>('unlock');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState<boolean | null>(null);
  const vaultPath = 'vault.json';

  useEffect(() => {
    vaultExists(vaultPath).then(setExists).catch(() => setExists(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'create') {
        if (password.length < 8) {
          setError('Master password must be at least 8 characters');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await createVault(vaultPath, password);
      } else {
        await unlockVault(vaultPath, password);
      }
      onUnlocked(vaultPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'unlock' ? 'create' : 'unlock');
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  if (exists === null) return null;

  const isCreate = exists === false || mode === 'create';

  return (
    <div className="unlock-screen">
      <h1>Secure Vault</h1>
      <p>Open-source password manager</p>

      <form className="unlock-form" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Master password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />

        {isCreate && (
          <input
            type="password"
            placeholder="Confirm master password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}

        {error && <div className="error">{error}</div>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? '...' : isCreate ? 'Create Vault' : 'Unlock Vault'}
        </button>

        <button className="btn-ghost" type="button" onClick={toggleMode}>
          {isCreate
            ? 'I already have a vault'
            : 'Create a new vault'}
        </button>
      </form>
    </div>
  );
}
