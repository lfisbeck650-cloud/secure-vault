import { useState, useEffect, useCallback } from 'react';
import { UnlockScreen } from './components/UnlockScreen';
import { MainLayout } from './components/MainLayout';
import { Settings } from './components/Settings';
import type { Screen } from './types';
import { isUnlocked, lockVault } from './tauri';
import './App.css';

function App() {
  const [screen, setScreen] = useState<Screen>('unlock');
  const [vaultPath, setVaultPath] = useState<string>('');

  useEffect(() => {
    const checkLock = async () => {
      if (screen === 'main') {
        const unlocked = await isUnlocked().catch(() => false);
        if (!unlocked) setScreen('unlock');
      }
    };
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, [screen]);

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
        onBack={() => setScreen('main')}
        onLock={handleLock}
      />
    );
  }

  if (screen === 'unlock') {
    return <UnlockScreen onUnlocked={handleUnlocked} />;
  }

  return (
    <MainLayout
      onLock={handleLock}
      onOpenSettings={() => setScreen('settings')}
    />
  );
}

export default App;
