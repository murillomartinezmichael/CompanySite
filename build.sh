#!/usr/bin/env bash
# Clean-clone setup for the actual Astro site. Never publishes.
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
command -v npm >/dev/null 2>&1 || { echo "[fail] Install Node and npm first." >&2; exit 1; }
npm ci
npm run build
npm test
echo "[build] READY: build fence and tests passed. Preview with npm run preview."
