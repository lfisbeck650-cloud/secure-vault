import { useState, useEffect } from 'react';
import { generatePassword } from '../tauri';

interface Props {
  onClose: () => void;
}

export function PasswordGenerator({ onClose }: Props) {
  const [length, setLength] = useState(24);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setError('');
    try {
      const result = await generatePassword(length, uppercase, lowercase, digits, symbols);
      setPassword(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    generate();
  }, [length, uppercase, lowercase, digits, symbols]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const strength = () => {
    const score = (uppercase ? 1 : 0) + (lowercase ? 1 : 0) + (digits ? 1 : 0) + (symbols ? 1 : 0);
    const bits = length * (score / 4) * 2;
    if (bits < 40) return { label: 'Weak', color: 'bg-vault-danger', text: 'text-vault-danger' };
    if (bits < 60) return { label: 'Fair', color: 'bg-vault-warning', text: 'text-vault-warning' };
    if (bits < 80) return { label: 'Good', color: 'bg-yellow-400', text: 'text-yellow-400' };
    if (bits < 100) return { label: 'Strong', color: 'bg-vault-success', text: 'text-vault-success' };
    return { label: 'Very Strong', color: 'bg-vault-success', text: 'text-vault-success' };
  };

  const s = strength();

  const toggleClass = (on: boolean) =>
    `relative w-9 h-5 rounded-full transition-all cursor-pointer ${
      on ? 'bg-vault-accent' : 'bg-vault-border'
    }`;

  const toggleCircle = (on: boolean) =>
    `absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
      on ? 'translate-x-4' : 'translate-x-0'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass rounded-2xl p-6 w-full max-w-md mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vault-accent to-vault-accent-light flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-vault-text">Password Generator</h3>
        </div>

        {/* Result */}
        <div className="bg-vault-surface rounded-xl p-4 border border-vault-border/30 mb-5">
          <div className="flex items-center gap-2">
            <span className="flex-1 font-mono text-sm text-vault-text break-all select-all">
              {password || '...'}
            </span>
            <button onClick={handleCopy} className={`btn-modern rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              copied
                ? 'bg-vault-success/15 text-vault-success border border-vault-success/20'
                : 'btn-secondary-modern'
            }`}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={generate} className="btn-modern btn-primary-modern rounded-lg px-3 py-1.5 text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
          {/* Strength bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-vault-surface overflow-hidden">
              <div className={`h-full rounded-full transition-all ${s.color}`}
                style={{ width: `${Math.min(100, ((s.label === 'Weak' ? 25 : s.label === 'Fair' ? 50 : s.label === 'Good' ? 70 : s.label === 'Strong' ? 85 : 100)))}%` }}
              />
            </div>
            <span className={`text-[10px] font-semibold ${s.text}`}>{s.label}</span>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-vault-text-secondary mb-2 block">Length: <span className="text-vault-text font-semibold">{length}</span></label>
            <input
              type="range"
              min={4}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-vault-accent h-1.5 rounded-full appearance-none bg-vault-surface cursor-pointer"
              style={{ accentColor: '#6c5ce7' }}
            />
            <div className="flex justify-between text-[10px] text-vault-text-muted mt-0.5">
              <span>4</span>
              <span>64</span>
            </div>
          </div>

          {([
            ['Uppercase (A-Z)', uppercase, setUppercase],
            ['Lowercase (a-z)', lowercase, setLowercase],
            ['Digits (0-9)', digits, setDigits],
            ['Symbols (!@#$...)', symbols, setSymbols],
          ] as const).map(([label, checked, setter]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-vault-text-secondary">{label}</span>
              <div className={toggleClass(checked)} onClick={() => setter(!checked)}>
                <div className={toggleCircle(checked)} />
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 text-xs text-vault-danger bg-vault-danger/10 rounded-xl px-4 py-2.5 border border-vault-danger/20">
            {error}
          </div>
        )}

        <div className="flex justify-end mt-6 pt-4 border-t border-vault-border/50">
          <button onClick={onClose} className="btn-modern btn-secondary-modern rounded-xl px-5 py-2 text-sm font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
