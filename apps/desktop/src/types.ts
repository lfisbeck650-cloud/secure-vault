export interface Entry {
  id: string;
  title: string;
  username: string;
  password: string | null;
  url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VaultData {
  entries: Entry[];
  created_at: string;
  updated_at: string;
}

export type Screen = 'unlock' | 'main' | 'settings';
export type Theme = 'dark' | 'light';
