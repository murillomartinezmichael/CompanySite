#!/usr/bin/env bash
# CompanySite — Astro 4 + Tailwind. First-run env prep.
set -euo pipefail
cd "$(dirname "$0")"
command -v npm >/dev/null || { echo "[ERROR] npm not on PATH (install Node 18+)"; exit 1; }
echo "[1/1] npm install..."
npm install
echo "Setup complete. Start dev server with: ./run.sh"
