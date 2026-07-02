# Threat Model

## Adversaries

| Adversary | Capabilities |
|-----------|-------------|
| Lost/stolen device | Full filesystem access to vault file |
| Malware (limited) | Read memory, keylog (in-scope) |
| Remote attacker | Network access (out-of-scope, no server) |
| Forensic analyst | Disk analysis, memory dumps |

## Protections

| Threat | Mitigation |
|--------|-----------|
| Offline brute force | Argon2id (19456 MiB, 2 iterations) |
| Disk theft | AES-256-GCM encrypted vault |
| Memory scraping | Zeroizing memory on drop |
| Clipboard leakage | Auto-clear on timeout (planned) |
| Unattended device | Auto-lock on inactivity (planned) |

## Non-Goals (Initial)

- Cloud sync
- Network services
- Biometric unlock
- Browser extension
