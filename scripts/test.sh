#!/usr/bin/env bash
# scripts/test.sh — Makefile hook. `make test` calls this.
# Args: (none) | unit | integration | e2e
# Unit-only for now — integration / e2e slots reserved for later rungs.
set -euo pipefail

TIER="${1:-all}"

case "$TIER" in
  unit|all)
    echo "▸ vitest run (functions/_lib + src/lib)"
    npm run test --silent
    ;;
  integration)
    echo "▸ integration: not-yet-implemented (Rung 2 shipped unit tier only)"
    exit 0
    ;;
  e2e)
    echo "▸ e2e: not-yet-implemented (deferred until deploy)"
    exit 0
    ;;
  *)
    echo "unknown tier: $TIER" >&2
    exit 2
    ;;
esac
