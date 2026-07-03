import { useState, useEffect, useCallback } from 'react';
import { UnlockScreen } from './components/UnlockScreen';
import { MainLayout } from './components/MainLayout';
import { Settings } from './components/Settings';
import type { Screen, Theme } from './types';
import { isUnlocked, lockVault } from './tauri';
import './App.css';

function App() {
  const [screen, setScreen] = useState<Screen>('unlock');
  const [vaultPath, setVaultPath] = useState<string>('');
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('vault-theme') as Theme) || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vault-theme', theme);
  }, [theme]);

  useEffect(() => {
    const checkLock = async () => {
      if (screen === 'main') {
        const unlocked = await isUnlocked().catch(() => false);
        if (!unlocked) setScreen('unlock');
      }
    };
    const interval = setInterval(checkLock, 2000);
    return () => clearInterval(interval);
  }, [screen]);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  const handleUnlocked = useCallback((path: string) => {
    setVaultPath(path);
    setScreen('main');
  }, []);

  const handleLock = useCallback(async () => {
    await lockVault();
    setScreen('unlock');
  }, []);

  if (screen === 'settings') {
    return (
      <Settings
        vaultPath={vaultPath}
        theme={theme}
        onToggleTheme={toggleTheme}
        onBack={() => setScreen('main')}
        onLock={handleLock}
      />
    );
  }

  if (screen === 'unlock') {
    return <UnlockScreen onUnlocked={handleUnlocked} theme={theme} onToggleTheme={toggleTheme} />;
  }

  return (
    <MainLayout
      onLock={handleLock}
      onOpenSettings={() => setScreen('settings')}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}

export default App;
