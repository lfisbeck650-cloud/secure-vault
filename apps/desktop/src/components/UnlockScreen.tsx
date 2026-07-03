import { useState, useEffect } from 'react';
import { createVault, unlockVault, vaultExists, getVaultPath, setUserName } from '../tauri';
import type { Theme } from '../types';

interface Props {
  onUnlocked: (path: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function UnlockScreen({ onUnlocked, theme, onToggleTheme }: Props) {
  const [step, setStep] = useState<'check' | 'welcome' | 'unlock'>('check');
  const [vaultPath, setVaultPath_] = useState('');
  const [userName, setUserName_] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    getVaultPath().then((path) => {
      setVaultPath_(path);
      return vaultExists(path);
    }).then((exists) => {
      setStep(exists ? 'unlock' : 'welcome');
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
      if (userName.trim()) await setUserName(userName.trim());
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

  if (step === 'check') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#06060a]">
        <div className="w-8 h-8 border-2 border-vault-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden bg-[#06060a]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-vault-accent rounded-full opacity-[0.08] blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-vault-accent-light rounded-full opacity-[0.05] blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-vault-accent rounded-full opacity-[0.03] blur-3xl" />
      </div>

      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        className="absolute top-6 right-6 p-2 rounded-xl glass text-vault-text-secondary hover:text-vault-text transition-all z-10"
      >
        {theme === 'dark' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>

      {step === 'welcome' ? (
        <div className="animate-fade-in relative z-10 w-full max-w-md mx-4">
          <div className="glass rounded-2xl p-8 md:p-10 gradient-border">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-vault-accent to-vault-accent-light flex items-center justify-center shadow-lg shadow-vault-accent-glow">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold gradient-text">Secure Vault</h1>
              <p className="text-vault-text-secondary text-sm mt-2 leading-relaxed">
                Your local, zero-knowledge password manager.<br />
                Everything is encrypted before it touches your disk.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-vault-text-secondary mb-1.5 tracking-wide">YOUR NAME</label>
                <input
                  className="input-modern w-full rounded-xl px-4 py-2.5 text-sm"
                  placeholder="What should we call you?"
                  value={userName}
                  onChange={(e) => setUserName_(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-vault-text-secondary mb-1.5 tracking-wide">MASTER PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input-modern w-full rounded-xl px-4 py-2.5 text-sm pr-10"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-text-muted hover:text-vault-text-secondary">
                    {showPw ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-vault-text-secondary mb-1.5 tracking-wide">CONFIRM PASSWORD</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-modern w-full rounded-xl px-4 py-2.5 text-sm"
                  placeholder="Repeat your master password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="text-xs text-vault-danger bg-vault-danger/10 rounded-xl px-4 py-2.5 border border-vault-danger/20">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-modern btn-primary-modern w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : 'Create My Vault'}
              </button>
            </form>
          </div>

          <p className="text-center text-vault-text-muted text-xs mt-6">
            Powered by AES-256-GCM &bull; Argon2id &bull; Zero-Knowledge
          </p>
        </div>
      ) : (
        <div className="animate-fade-in relative z-10 w-full max-w-sm mx-4">
          <div className="glass rounded-2xl p-8 md:p-10 gradient-border text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-vault-accent to-vault-accent-light flex items-center justify-center shadow-lg shadow-vault-accent-glow">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold gradient-text mb-1">Secure Vault</h1>
            <p className="text-vault-text-secondary text-sm mb-8">Enter your master password to unlock</p>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-modern w-full rounded-xl px-4 py-2.5 text-sm pr-10"
                  placeholder="Master password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-text-muted hover:text-vault-text-secondary">
                  {showPw ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>

              {error && (
                <div className="text-xs text-vault-danger bg-vault-danger/10 rounded-xl px-4 py-2.5 border border-vault-danger/20">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-modern btn-primary-modern w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Unlocking...
                  </span>
                ) : 'Unlock Vault'}
              </button>
            </form>
          </div>

          <p className="text-center text-vault-text-muted text-xs mt-6">
            Powered by AES-256-GCM &bull; Argon2id &bull; Zero-Knowledge
          </p>
        </div>
      )}
    </div>
  );
}
