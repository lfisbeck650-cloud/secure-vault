# Security Design

## Cryptography

| Algorithm | Parameter | Value |
|-----------|-----------|-------|
| Argon2id | Memory | 19456 KiB |
| Argon2id | Iterations | 2 |
| Argon2id | Parallelism | 1 |
| Argon2id | Output | 256 bits |
| AES-256-GCM | Key size | 256 bits |
| AES-256-GCM | Nonce | 96 bits (random) |

## Vault Encryption Flow

```
Master Password
     ↓
Argon2id (with random salt)
     ↓
256-bit Encryption Key
     ↓
AES-256-GCM Encrypt (JSON data)
     ↓
Base64(nonce + ciphertext)
     ↓
{ salt, ciphertext, kdf_params } → JSON → Disk
```

## Key Handling

- Derived key stored in `Zeroizing<Vec<u8>>` — zeroed on drop
- Master password never stored
- Salt stored alongside ciphertext (not secret, unique per vault)
