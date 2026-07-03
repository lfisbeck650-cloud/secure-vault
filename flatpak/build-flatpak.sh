#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

echo "=== Building frontend ==="
cd apps/desktop
npm ci
npm run build
cd "$PROJECT_DIR"

echo "=== Building Rust backend ==="
cargo build --release --manifest-path apps/desktop/src-tauri/Cargo.toml

echo "=== Building Flatpak ==="
flatpak-builder --force-clean --install-deps-from=flathub \
  build-dir flatpak/com.securevault.desktop.json

echo "=== Exporting to repo ==="
flatpak build-export --no-update-summary repo build-dir
flatpak build-update-repo --generate-static-deltas repo

echo "=== Creating .flatpak bundle ==="
flatpak build-bundle repo com.securevault.desktop.flatpak com.securevault.desktop master

echo "=== Done ==="
echo "Bundle: com.securevault.desktop.flatpak"
echo "Repo: repo/"
echo "Flatpakref: flatpak/com.securevault.desktop.flatpakref"
