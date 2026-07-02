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
    } catch {
      // ignore
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Password Generator</h3>

        <div className="pw-generator">
          <div className="pw-result">
            <span className="pw-text">{password || '...'}</span>
            <button className="btn-ghost btn-sm" onClick={handleCopy}>
              Copy
            </button>
            <button className="btn-primary btn-sm" onClick={generate}>
              Regenerate
            </button>
          </div>

          <div className="pw-options">
            <div className="pw-length">
              <label>Length: {length}</label>
              <input
                type="range"
                min={4}
                max={64}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
              />
            </div>

            <div className="pw-option">
              <label>Uppercase (A-Z)</label>
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
              />
            </div>

            <div className="pw-option">
              <label>Lowercase (a-z)</label>
              <input
                type="checkbox"
                checked={lowercase}
                onChange={(e) => setLowercase(e.target.checked)}
              />
            </div>

            <div className="pw-option">
              <label>Digits (0-9)</label>
              <input
                type="checkbox"
                checked={digits}
                onChange={(e) => setDigits(e.target.checked)}
              />
            </div>

            <div className="pw-option">
              <label>Symbols (!@#$...)</label>
              <input
                type="checkbox"
                checked={symbols}
                onChange={(e) => setSymbols(e.target.checked)}
              />
            </div>
          </div>

          {error && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
