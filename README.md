# Secure Vault

A local, zero-knowledge password manager built with Rust and Tauri.

**Zero-knowledge** — No one but you can decrypt your data. Everything is encrypted with AES-256-GCM before touching disk.

## Architecture

```
apps/desktop/    → Tauri desktop app (React + TypeScript)
vault_core/      → Core business logic (Rust)
security/        → Encryption, KDF, crypto (Rust)
storage/         → Vault data model & file storage (Rust)
utils/           → Password generator (Rust)
```

## Security

- **Key Derivation**: Argon2id (19456 KiB memory, 2 iterations)
- **Encryption**: AES-256-GCM with random nonces
- **Entropy**: OS secure random number generator
- **Memory**: Sensitive data zeroed on drop
- **Storage**: Only encrypted blobs on disk

## Development

### Prerequisites

- Rust 1.77+
- Node.js 20+
- Tauri system dependencies

### Build & Run

```bash
# Install frontend deps
cd apps/desktop && npm install

# Run in development mode
cd apps/desktop && npx tauri dev

# Build for production
cd apps/desktop && npx tauri build
```

### Tests

```bash
cargo test
```
