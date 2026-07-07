#!/usr/bin/env bash
# CompanySite — Astro dev server on http://localhost:4321
set -euo pipefail
cd "$(dirname "$0")"
command -v npm >/dev/null || { echo "[ERROR] npm not on PATH — run ./setup.sh first"; exit 1; }
echo "Starting Astro dev server on http://localhost:4321"
echo "Press Ctrl+C to stop."
npm run dev
