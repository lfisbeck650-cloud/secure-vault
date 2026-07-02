# Architecture

## System Layers

```
┌─────────────────────────────┐
│      UI Layer (Tauri)       │
│   React + TypeScript        │
│   Presentation only         │
├─────────────────────────────┤
│   Application Core (Rust)   │
│   vault_core                │
│   Business logic            │
├─────────────────────────────┤
│  Security & Storage (Rust)  │
│   security/  storage/       │
│   Encryption, KDF, vault    │
└─────────────────────────────┘
```

## Data Flow

```
User Input → UI → Tauri Command → vault_core::VaultApi
  → vault_core::VaultService → storage::VaultFile
    → security::encryption → AES-256-GCM
      → Encrypted blob → Disk
```

## Key Decisions

- **Zero-knowledge**: Master password never stored. Key derived via Argon2id on each unlock.
- **Single file vault**: All entries stored in one encrypted JSON blob.
- **Session key**: Derived key held in memory (Zeroizing) during unlocked session.
