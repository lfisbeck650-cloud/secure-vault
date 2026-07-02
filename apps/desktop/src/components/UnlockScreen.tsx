import { useState, useEffect } from 'react';
import { createVault, unlockVault, vaultExists, getVaultPath, setUserName } from '../tauri';

interface Props {
  onUnlocked: (path: string) => void;
}

export function UnlockScreen({ onUnlocked }: Props) {
  const [step, setStep] = useState<'check' | 'welcome' | 'unlock'>('check');
  const [vaultPath, setVaultPath] = useState('');
  const [userName, setUserName_] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getVaultPath().then((path) => {
      setVaultPath(path);
      return vaultExists(path);
    }).then((exists) => {
      if (exists) {
        setStep('unlock');
      } else {
        setStep('welcome');
      }
    }).catch(() => {
      setStep('welcome');
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Master password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await createVault(vaultPath, password);
      if (userName.trim()) {
        await setUserName(userName.trim());
      }
      onUnlocked(vaultPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await unlockVault(vaultPath, password);
      onUnlocked(vaultPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  if (step === 'check') return null;

  if (step === 'welcome') {
    return (
      <div className="unlock-screen">
        <div className="welcome-card">
          <div className="welcome-icon">🔐</div>
          <h1>Welcome to Secure Vault</h1>
          <p className="welcome-subtitle">
            Your local, zero-knowledge password manager.
            Everything is encrypted before it touches your disk.
          </p>

          <form className="unlock-form" onSubmit={handleCreate}>
            <div className="form-group">
              <label>What should we call you?</label>
              <input
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName_(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Master password</label>
              <input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Confirm master password</label>
              <input
                type="password"
                placeholder="Repeat your master password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create My Vault'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="unlock-screen">
      <h1>Secure Vault</h1>
      <p>Enter your master password to unlock</p>

      <form className="unlock-form" onSubmit={handleUnlock}>
        <input
          type="password"
          placeholder="Master password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />

        {error && <div className="error">{error}</div>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? '...' : 'Unlock Vault'}
        </button>
      </form>
    </div>
  );
}
