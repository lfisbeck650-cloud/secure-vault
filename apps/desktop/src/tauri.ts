import { invoke } from '@tauri-apps/api/core';
import type { Entry } from './types';

export async function createVault(path: string, masterPassword: string): Promise<void> {
  await invoke('create_vault', { path, masterPassword });
}

export async function unlockVault(path: string, masterPassword: string): Promise<void> {
  await invoke('unlock_vault', { path, masterPassword });
}

export async function lockVault(): Promise<void> {
  await invoke('lock_vault');
}

export async function vaultExists(path: string): Promise<boolean> {
  return await invoke('vault_exists', { path });
}

export async function isUnlocked(): Promise<boolean> {
  return await invoke('is_unlocked');
}

export async function addEntry(title: string, username: string, password: string): Promise<Entry> {
  return await invoke('add_entry', { title, username, password });
}

export async function updateEntry(
  id: string,
  title: string,
  username: string,
  password: string | null,
  url: string | null,
  notes: string | null
): Promise<Entry> {
  return await invoke('update_entry', { id, title, username, password, url, notes });
}

export async function deleteEntry(id: string): Promise<void> {
  await invoke('delete_entry', { id });
}

export async function getEntries(): Promise<Entry[]> {
  return await invoke('get_entries');
}

export async function searchEntries(query: string): Promise<Entry[]> {
  return await invoke('search_entries', { query });
}

export async function generatePassword(
  length: number,
  uppercase: boolean,
  lowercase: boolean,
  digits: boolean,
  symbols: boolean
): Promise<string> {
  return await invoke('generate_password', { length, uppercase, lowercase, digits, symbols });
}

export async function exportVault(): Promise<string> {
  return await invoke('export_vault');
}

export async function importVault(data: string): Promise<void> {
  await invoke('import_vault', { data });
}
