# Secure Vault

A modern, local zero-knowledge password manager. Open source, encrypted, no cloud required.

**Zero-knowledge** — No one but you can decrypt your data. Everything is encrypted with AES-256-GCM before touching disk. Your master password never leaves your device.

## Features

- **Modern Glassmorphism UI** — Sleek dark/light theme with blur effects and smooth animations
- **Encrypted local vault** — AES-256-GCM + Argon2id key derivation
- **Master password unlock** — Create or unlock your vault securely
- **Full CRUD** — Add, edit, delete, and search entries
- **Password generator** — Configurable length & character types with strength indicator
- **Clipboard auto-clear** — Copied passwords are cleared from clipboard after 15 seconds
- **One-click copy** — Copy usernames, passwords, and URLs
- **Dark / Light theme** — Toggle between themes, persisted across sessions
- **Export / Import** — Encrypted vault backup and restore
- **Auto-lock detection** — Automatically returns to unlock screen if vault is locked

## Architecture

```
apps/desktop/    → Tauri desktop app (React + TypeScript + Tailwind CSS)
vault_core/      → Core business logic (Rust)
security/        → Argon2id KDF, AES-256-GCM encryption (Rust)
storage/         → Vault data model, file I/O, serialization (Rust)
utils/           → Password generator (Rust)
```

## Security

- **Key Derivation**: Argon2id (19456 KiB memory, 2 iterations, 1 parallelism)
- **Encryption**: AES-256-GCM with random 96-bit nonces
- **Entropy**: OS secure random number generator
- **Memory**: Sensitive data zeroed on drop (`Zeroizing`)
- **Storage**: Only encrypted blobs on disk — no plaintext

## Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) 1.77+
- [Node.js](https://nodejs.org/) 20+
- [Tauri system dependencies](https://v2.tauri.app/start/prerequisites/)

### Run in development mode

```bash
cd apps/desktop
npm install
npx tauri dev
```

### Build for production

```bash
cd apps/desktop
npx tauri build
```

The installer binary will be in `apps/desktop/src-tauri/target/release/bundle/`.

### Run tests

```bash
cargo test
```

## Download

Pre-built binaries are available on the [Releases](https://github.com/lfisbeck650-cloud/secure-vault/releases) page. Linux packages: `.deb`, `.rpm`, and `.AppImage`.

## License

MIT
